'use server'

import { requireUser } from '@/lib/auth0'
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

const languageToJudge0Id: Record<string, number> = {
  'javascript': 93,
  'python': 71,
  'java': 62,
  'cpp': 54,
  'go': 60,
  'rust': 73,
  'typescript': 74,
  'kotlin': 78,
  'swift': 83,
}

export async function findOrJoinMatch(challengeId: number, language: string) {
  const user = await requireUser()
  const userId = user.id

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
        playerTwoLanguage: language,
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
        playerOneLanguage: language,
        status: 'pending',
      })
      .returning()

    return { status: 'created', match: newMatch }
  }
}

export async function submitP2PChallenge(matchId: number, code: string, language: string) {
  const user = await requireUser();
  const userId = user.id;

    const match = await db.query.challengeMatches.findFirst({
        where: eq(challengeMatches.id, matchId),
        with: { challenge: true }
    });

    if (!match || (match.playerOneId !== userId && match.playerTwoId !== userId)) {
        throw new Error('Match not found or user not part of match');
    }

    if (match.status !== 'in_progress') {
        if (match.status === 'completed') {
            return { error: 'Match is already over.' };
        }
        return { error: 'Match is not in progress.' };
    }

    const challenge = match.challenge;
    // @ts-ignore
    if (!challenge || !challenge.testCases || challenge.testCases.length === 0) {
        throw new Error('Challenge data or test cases not found.');
    }

    const judge0LanguageId = languageToJudge0Id[language];
    if (!judge0LanguageId) {
      return { error: `Language '${language}' is not supported for competition.` };
    }
    
    if (match.playerOneId === userId) {
      await db.update(challengeMatches).set({ playerOneCode: code }).where(eq(challengeMatches.id, matchId));
    } else {
      await db.update(challengeMatches).set({ playerTwoCode: code }).where(eq(challengeMatches.id, matchId));
    }

    // @ts-ignore
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
                const errorBody = await response.text();
                console.error("Judge0 API Error:", errorBody);
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
        const finalMatchCheck = await db.query.challengeMatches.findFirst({
            where: eq(challengeMatches.id, matchId),
            columns: { status: true }
        });

        if (finalMatchCheck?.status === 'in_progress') {
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

            revalidateTag(`get_user_progress::${match.playerOneId}`);
            if (match.playerTwoId) {
                revalidateTag(`get_user_progress::${match.playerTwoId}`);
            }
        }

        return { success: true, results: results };

    } else {
        // await pusher.trigger(`private-match-${matchId}-user-${userId}`, 'submission-failed', {
        //     results: results
        // });
        const failedResult = results.find(r => r.status.id !== 3);
        const errorMessage = failedResult?.status?.description || 'Your solution failed one or more test cases.';
        return { error: errorMessage, results: results };
    }
}

export async function sendProgressUpdate(matchId: number, code: string, language: string) {
  const user = await requireUser();
  const userId = user.id;

    await pusher.trigger(`private-match-${matchId}`, `opponent-progress`, {
        senderId: userId,
        codeLength: code.length,
        language: language
    });
}