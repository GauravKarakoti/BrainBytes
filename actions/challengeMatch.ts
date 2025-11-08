'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/db/drizzle'
import { challengeMatches, userProgress } from '@/db/schema'
import { and, eq, isNull, sql, not } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

export async function findOrJoinMatch(challengeId: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const existingMatch = await db.query.challengeMatches.findFirst({
    where: and(
      eq(challengeMatches.status, 'pending'),
      eq(challengeMatches.playerOneId, userId),
      eq(challengeMatches.challengeId, challengeId)
    )
  });

  if (existingMatch) {
     return { status: 'waiting', match: existingMatch };
  }

  const pendingMatch = await db.query.challengeMatches.findFirst({
    where: and(
      eq(challengeMatches.challengeId, challengeId),
      eq(challengeMatches.status, 'pending'),
      isNull(challengeMatches.playerTwoId),
      not(eq(challengeMatches.playerOneId, userId))
    )
  })

  if (pendingMatch) {
    const [updatedMatch] = await db.update(challengeMatches)
      .set({
        playerTwoId: userId,
        status: 'in_progress',
        startedAt: new Date(),
      })
      .where(eq(challengeMatches.id, pendingMatch.id))
      .returning()

    await pusher.trigger(`private-match-${updatedMatch.id}`, 'match-start', {
      match: updatedMatch,
    })

    return { status: 'joined', match: updatedMatch }
  } else {
    const [newMatch] = await db.insert(challengeMatches)
      .values({
        challengeId,
        playerOneId: userId,
        status: 'pending',
      })
      .returning()

    return { status: 'created', match: newMatch }
  }
}

export async function submitP2PChallenge(matchId: number, code: string, language: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const match = await db.query.challengeMatches.findFirst({
        where: eq(challengeMatches.id, matchId),
        with: { challenge: true }
    });

    if (!match || (match.playerOneId !== userId && match.playerTwoId !== userId)) {
        throw new Error('Match not found or user not part of match');
    }

    if (match.status !== 'in_progress') {
        return { error: 'Match is not in progress.' };
    }

    const challenge = match.challenge;
    if (!challenge || !challenge.testCases) {
        throw new Error('Challenge data not found.');
    }

    // TODO: Map your 'language' to Judge0's language_id
    const judge0LanguageId = 71;

    const testCases = challenge.testCases as Array<{input: string, output: string}>;

    let allTestsPassed = true;
    const results = [];

    try {
        for (const testCase of testCases) {
            const response = await fetch(`https://${process.env.NEXT_PUBLIC_JUDGE0_HOST}/submissions?base64_encoded=false&wait=true`, {
                method: 'POST',
                headers: {
                    'x-rapidapi-key': process.env.JUDGE0_API_KEY!,
                    'x-rapidapi-host': process.env.NEXT_PUBLIC_JUDGE0_HOST!,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    language_id: judge0LanguageId,
                    source_code: code,
                    stdin: testCase.input,
                    expected_output: testCase.output,
                }),
            });

            if (!response.ok) {
                throw new Error(`Judge0 API error: ${response.statusText}`);
            }

            const result = await response.json();
            results.push(result);

            if (result.status.id !== 3) {
                allTestsPassed = false;
                break; 
            }
        }
    } catch (error) {
        console.error(error);
        return { error: 'Code execution failed.' };
    }


    if (allTestsPassed) {
        const [updatedMatch] = await db.update(challengeMatches)
            .set({
                status: 'completed',
                winnerId: userId,
                endedAt: new Date()
            })
            .where(eq(challengeMatches.id, matchId))
            .returning();

        await db.update(userProgress)
          .set({
            points: sql`${userProgress.points} + 25`,
            gems: sql`${userProgress.gems} + 1`
          })
          .where(eq(userProgress.userId, userId));

        await pusher.trigger(`private-match-${matchId}`, 'match-over', {
            winnerId: userId,
            results: results
        });

        revalidateTag(`get_user_progress::${userId}`);
        revalidateTag(`get_user_progress::${match.playerOneId === userId ? match.playerTwoId : match.playerOneId}`);

        return { success: true, results: results };

    } else {
        await pusher.trigger(`private-match-${matchId}-user-${userId}`, 'submission-failed', {
            results: results
        });
        return { success: false, results: results };
    }
}

export async function sendProgressUpdate(matchId: number, code: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    await pusher.trigger(`private-match-${matchId}`, `opponent-progress`, {
        senderId: userId,
        codeLength: code.length 
    });
}