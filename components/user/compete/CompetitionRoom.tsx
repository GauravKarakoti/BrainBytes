'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { ChallengeType, ChallengeMatchType } from '@/db/schema'
import { findOrJoinMatch, submitP2PChallenge, sendProgressUpdate } from '@/actions/challengeMatch'
import Editor from '@monaco-editor/react'
import Pusher from 'pusher-js'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'

type Props = {
  challenge: ChallengeType
}

export function CompetitionRoom({ challenge }: Props) {
  const [match, setMatch] = useState<ChallengeMatchType | null>(null)
  const [status, setStatus] = useState<'idle' | 'waiting' | 'in_progress' | 'completed'>('idle')
  const [code, setCode] = useState(challenge.stubCodeJs || '// Start coding here')
  const [opponentCodeLength, setOpponentCodeLength] = useState(0)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, startSubmission] = useTransition()

  const { user } = useUser(); 
  const userId = user?.id;

  const findingRef = useRef(false);

  useEffect(() => {
    if (findingRef.current) return;
    if (status !== 'idle' || !challenge.id || error) return;

    findingRef.current = true;
    setStatus('waiting');
    toast.loading('Finding an opponent...');

    let cancelled = false;

    (async () => {
      try {
        const result: any = await findOrJoinMatch(challenge.id);
        if (cancelled) return;

        setMatch(result.match);

        if (result.status === 'joined') {
          setStatus('in_progress');
          toast.success('Opponent found! The match has started.');
        } else {
          setStatus('waiting');
          toast.dismiss();
          toast('Waiting for an opponent to join...');
        }
      } catch (err: any) {
        if (cancelled) return;
        toast.error(err?.message ?? 'Failed to find a match');
        setError(err?.message ?? String(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [challenge.id, status, error]);


  useEffect(() => {
    if (status === 'idle' && challenge.id && !error) {
      setStatus('waiting');
      toast.loading('Finding an opponent...');
      findOrJoinMatch(challenge.id)
        .then((result:any) => {
          setMatch(result.match);
          if (result.status === 'joined') {
            setStatus('in_progress');
            toast.success('Opponent found! The match has started.');
          } else {
            setStatus('waiting');
            toast.dismiss();
            toast('Waiting for an opponent to join...');
          }
        })
        .catch((err:any) => {
          toast.error(err.message);
          setError(err.message);
        });
    }
  }, [status, challenge.id, error]);

  useEffect(() => {
    if (!match?.id || !userId) return;

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
    });

    const channelName = `private-match-${match.id}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind('match-start', (data: { match: ChallengeMatchType }) => {
      setMatch(data.match);
      setStatus('in_progress');
      toast.dismiss();
      toast.success('Opponent found! The match has started.');
    });

    channel.bind('opponent-progress', (data: { senderId: string, codeLength: number }) => {
      if (data.senderId !== userId) {
        setOpponentCodeLength(data.codeLength);
      }
    });

    channel.bind('match-over', (data: { winnerId: string }) => {
      setWinnerId(data.winnerId);
      setStatus('completed');
      toast.dismiss();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.disconnect();
    };

  }, [match?.id, userId]);

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    if (match && status === 'in_progress') {
      sendProgressUpdate(match.id, value);
    }
  }

  const handleSubmit = () => {
    if (!match) return;
    startSubmission(() => {
      toast.loading('Submitting and testing your solution...');
      submitP2PChallenge(match.id, code, 'javascript') // TODO: Remove the hardcoded language
        .then((res:any) => {
          toast.dismiss();
          if(res.error) toast.error(res.error);
        })
        .catch((err:any) => {
          toast.dismiss();
          toast.error(err.message)
        });
    });
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <div className="text-2xl font-bold text-destructive">Error finding match</div>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => { setError(null); setStatus('idle'); }} variant="highlight" className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (status === 'waiting' || status === 'idle') {
    return (
      <div className="text-center p-10">
        <div className="text-2xl font-bold">Waiting for opponent...</div>
        <p className="text-muted-foreground">This may take a moment.</p>
        {/* TODO: Add a loading spinner here */}
      </div>
    )
  }

  if (status === 'completed' && winnerId) {
     return (
      <div className="text-center p-10">
        <div className="text-4xl font-bold mb-4">
          {winnerId === userId ? '脂 You Won! 脂' : '丼 You Lost 丼'}
        </div>
        <p>You gained 25 XP and 1 Gem!</p>
        {/* TODO: Link back to /compete */}
      </div>
     )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Problem</h2>
        {/* TODO: Use a markdown renderer for challenge.problemDescription */}
        <p className="text-muted-foreground">{challenge.problemDescription}</p>
      </div>

      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Opponent Status</h3>
            <p className="text-sm text-muted-foreground">Progress: {opponentCodeLength} characters</p>
        </div>

        <div className="h-[400px] border rounded-lg overflow-hidden">
          <Editor
            height="400px"
            language="javascript"
            theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'}
            value={code}
            onChange={handleCodeChange}
            options={{ minimap: { enabled: false } }}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || status !== 'in_progress'}
          variant="primary" 
          size="lg" 
          className="w-full"
        >
          {isSubmitting ? 'Testing...' : 'Submit Solution'}
        </Button>
      </div>
    </div>
  )
}