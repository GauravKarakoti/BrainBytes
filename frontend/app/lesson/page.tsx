'use client'

import { useState } from 'react'
import { redirect, useRouter } from 'next/navigation'
import { X, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Quiz } from '@/components/user/lesson/Quiz'
import { useExitModal } from '@/store/use-exit-modal'
import { useHeartsModal } from '@/store/use-hearts-modal'

type Challenge = {
  id: number
  type: 'SELECT' | 'HINT'
  question: string
  lessonId: number
  order: number
  challengeOptions: Array<{
    id: number
    challengeId: number
    option: string
    correct: boolean
    imageSrc: string | null
    audioSrc: string | null
  }>
  completed: boolean
}

export default function Lesson() {
  const router = useRouter()
  const { open: openExitModal } = useExitModal()
  const { open: openHeartsModal } = useHeartsModal()
  const [hearts, setHearts] = useState(5)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const challenges: Challenge[] = [
    {
      id: 1,
      type: 'SELECT',
      question: 'What is the time complexity of accessing an element in an array by index?',
      lessonId: 1,
      order: 1,
      completed: false,
      challengeOptions: [
        { id: 1, challengeId: 1, option: 'O(1)', correct: true, imageSrc: null, audioSrc: null },
        { id: 2, challengeId: 1, option: 'O(n)', correct: false, imageSrc: null, audioSrc: null },
        { id: 3, challengeId: 1, option: 'O(log n)', correct: false, imageSrc: null, audioSrc: null },
      ],
    },
    {
      id: 2,
      type: 'SELECT',
      question: 'Which operation on an array has O(n) time complexity?',
      lessonId: 1,
      order: 2,
      completed: false,
      challengeOptions: [
        { id: 4, challengeId: 2, option: 'Inserting at the end', correct: false, imageSrc: null, audioSrc: null },
        { id: 5, challengeId: 2, option: 'Finding an element', correct: true, imageSrc: null, audioSrc: null },
        { id: 6, challengeId: 2, option: 'Accessing by index', correct: false, imageSrc: null, audioSrc: null },
      ],
    },
  ]

  const currentChallenge = challenges[currentIndex]
  const percentage = Math.round(((currentIndex + 1) / challenges.length) * 100)

  const handleComplete = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      router.push('/learn')
    }
  }

  const handleExit = () => {
    openExitModal()
  }

  const handleHeartsEmpty = () => {
    openHeartsModal()
  }

  if (!currentChallenge) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Trophy className="mx-auto mb-4 size-16 text-primary" />
          <h1 className="text-3xl font-bold">Lesson Complete!</h1>
          <p className="mt-2 text-muted-foreground">Great job completing all challenges!</p>
          <Button onClick={() => router.push('/learn')} variant="primary" className="mt-6">
            Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b-2 bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Button variant="ghost" size="icon" onClick={handleExit}>
            <X className="size-6" />
          </Button>
          <div className="flex-1 px-4">
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">❤️</span>
            <span className="min-w-[2ch] text-lg font-bold">{hearts}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 text-sm text-muted-foreground">
            Question {currentIndex + 1} of {challenges.length}
          </div>
          <Quiz challenge={currentChallenge} onComplete={handleComplete} hearts={hearts} />
        </div>
      </main>
    </div>
  )
}
