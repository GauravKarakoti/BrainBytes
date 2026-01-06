'use client'

import { useState, useEffect, useTransition, useRef, useCallback } from 'react'
import { ChallengeType, ChallengeMatchType } from '@/db/schema'
import { findOrJoinMatch, submitP2PChallenge, sendProgressUpdate } from '@/actions/challengeMatch'
import Editor from '@monaco-editor/react'
import Pusher from 'pusher-js'
import { toast } from 'sonner'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'

const FINDING_TOAST_ID = 'competition-finding'
const WAITING_TOAST_ID = 'competition-waiting'
const SUBMISSION_TOAST_ID = 'competition-submitting'

type Props = {
  challenge: ChallengeType
  language: string
  initialCode: string
}

type SubmissionResult = {
  status: { id: number; description: string };
  stdin: string;
  expected_output: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
}

export function CompetitionRoom({ challenge, language, initialCode }: Props) {
  const router = useRouter()
  const [match, setMatch] = useState<ChallengeMatchType | null>(null)
  const [status, setStatus] = useState<'idle' | 'waiting' | 'in_progress' | 'completed'>('idle')
  const [code, setCode] = useState(initialCode)
  const [opponentCodeLength, setOpponentCodeLength] = useState(0)
  const [opponentLanguage, setOpponentLanguage] = useState<string | null>(null)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, startSubmission] = useTransition()
  
  const [submissionResults, setSubmissionResults] = useState<SubmissionResult[] | null>(null)

  const { user } = useUser()
  const userId = user?.sub

  const findingRef = useRef(false)

  const dismissStatusToasts = useCallback(() => {
    toast.dismiss(FINDING_TOAST_ID)
    toast.dismiss(WAITING_TOAST_ID)
  }, [])

  const startMatchSearch = useCallback(async () => {
    if (findingRef.current || !challenge.id) return

    findingRef.current = true
    setStatus('waiting')
    toast.loading('Finding an opponent...', { id: FINDING_TOAST_ID })

    try {
      const result: any = await findOrJoinMatch(challenge.id, language) 
      setMatch(result.match)

      if (result.status === 'joined') {
        dismissStatusToasts()
        setStatus('in_progress')
        toast.success('Opponent found! The match has started.')
        // @ts-ignore
        if (result.match.playerOneLanguage) {
          // @ts-ignore
          setOpponentLanguage(result.match.playerOneLanguage)
        }
      } else {
        setStatus('waiting')
        toast.info('Waiting for an opponent to join...', { id: WAITING_TOAST_ID })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to find a match'
      dismissStatusToasts()
      toast.error(message)
      setError(message)
    } finally {
      findingRef.current = false
    }
  }, [challenge.id, language, dismissStatusToasts])

  useEffect(() => {
    if (status === 'idle' && !error) {
      startMatchSearch()
    }
  }, [status, error, startMatchSearch])

  useEffect(() => {
    return () => {
      toast.dismiss(FINDING_TOAST_ID)
      toast.dismiss(WAITING_TOAST_ID)
      toast.dismiss(SUBMISSION_TOAST_ID)
    }
  }, [])

  useEffect(() => {
    if (!match?.id || !userId) return;

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
    });

    const channelName = `private-match-${match.id}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind('match-start', (data: { match: ChallengeMatchType }) => {
      setMatch(data.match);
      setStatus('in_progress');
      dismissStatusToasts();
      toast.success('Opponent found! The match has started.');
      
      const opponentId = data.match.playerOneId === userId 
        ? data.match.playerTwoId 
        : data.match.playerOneId;
      // @ts-ignore
      const oppLang = data.match.playerOneId === opponentId 
        ? data.match.playerOneLanguage 
        : data.match.playerTwoLanguage;
      setOpponentLanguage(oppLang);
    });

    channel.bind('opponent-progress', (data: { senderId: string, codeLength: number, language: string }) => {
      if (data.senderId !== userId) {
        setOpponentCodeLength(data.codeLength);
        setOpponentLanguage(data.language); 
      }
    });

    channel.bind('match-over', (data: { winnerId: string }) => {
      setWinnerId(data.winnerId);
      setStatus('completed');
      dismissStatusToasts();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.disconnect();
    };

  }, [dismissStatusToasts, match?.id, userId]);

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    if (match && status === 'in_progress') {
      sendProgressUpdate(match.id, value, language); 
    }
  }

  const handleSubmit = () => {
    if (!match) return;
    
    setSubmissionResults(null);
    
    startSubmission(() => {
      toast.loading('Submitting and testing your solution...', { id: SUBMISSION_TOAST_ID });
      submitP2PChallenge(match.id, code, language)
        .then((res:any) => {
          toast.dismiss(SUBMISSION_TOAST_ID);
          
          if (res?.results) {
            setSubmissionResults(res.results);
          }
          
          if (res?.error) {
            toast.error(res.error);
          }   
        })
        .catch((err:any) => {
          toast.dismiss(SUBMISSION_TOAST_ID);
          toast.error(err?.message ?? 'Submission failed')
          setSubmissionResults(null);
        });
    });
  }

  const testCases = (challenge.testCases as Array<{input: string, output: string}>) || [];

  if (error) {
    return (
      <div className="text-center p-10">
        <div className="text-2xl font-bold text-destructive">Error finding match</div>
        <p className="text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={() => {
            dismissStatusToasts()
            setError(null)
            setStatus('idle')
          }}
          className={cn(buttonVariants({ variant: 'highlight' }), 'mt-4')}
        >
          Try Again
        </button>
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
          {winnerId === userId ? '🎉 You Won! 🎉' : '😥 You Lost 😥'}
        </div>
        <p className="text-lg text-muted-foreground">
          {winnerId === userId 
            ? "You gained 25 XP and 1 Gem!" 
            : "Better luck next time!"}
        </p>
        <button
          type="button"
          onClick={() => router.push('/compete')}
          className={cn(buttonVariants({ variant: 'primary' }), 'mt-6')}
        >
          Find Another Match
        </button>
      </div>
     )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Problem</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {challenge.problemDescription}
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Examples</h3>
          <div className="space-y-3">
            {testCases.map((tc, index) => (
              <div key={index} className="bg-muted/50 p-3 rounded-md">
                <p className="font-mono text-sm">
                  <strong>Input:</strong> {tc.input}
                </p>
                <p className="font-mono text-sm">
                  <strong>Output:</strong> {tc.output}
                </p>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Opponent Status</h3>
            <p className="text-sm text-muted-foreground">
              {opponentLanguage ? `Coding in ${opponentLanguage}` : "Connecting..."}
            </p>
            <p className="text-sm text-muted-foreground">Progress: {opponentCodeLength} characters</p>
        </div>

        <div className="h-[300px] md:h-[400px] border rounded-lg overflow-hidden">
          <Editor
            height="100%"
            language={language}
            theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'}
            value={code}
            onChange={handleCodeChange}
            options={{ minimap: { enabled: false } }}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || status !== 'in_progress'}
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
        >
          {isSubmitting ? 'Testing...' : 'Submit Solution'}
        </button>
        
        {submissionResults && (
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold">Submission Results</h3>
            {submissionResults.map((result, index) => {
              const isPass = result.status.id === 3;
              const statusColor = isPass ? 'text-green-500' : 'text-red-500';
              const Icon = isPass ? CheckCircle : XCircle;

              return (
                <div key={index} className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className={cn("font-bold text-md", statusColor)}>
                      <Icon className="inline-block mr-2 size-5" />
                      Test Case {index + 1}: {result.status.description}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 font-mono text-sm">
                    <p><strong>Input:</strong> {result.stdin}</p>
                    <p><strong>Expected:</strong> {result.expected_output}</p>
                    <p>
                      <strong>Your Output:</strong>{" "}
                      {result.stdout ? result.stdout : (result.stderr || result.compile_output || "No output")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
      </div>
    </div>
  )
}