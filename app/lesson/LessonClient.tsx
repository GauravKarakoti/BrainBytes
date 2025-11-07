'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

type Lesson = {
  id: number
  title: string
  challenges: Challenge[]
}

type Props = {
  lesson: Lesson
  initialHearts: number
  initialPercentage: number
}

export function LessonClient({ lesson, initialHearts, initialPercentage }: Props) {
  const router = useRouter()
  const { open: openExitModal } = useExitModal()
  const { open: openHeartsModal } = useHeartsModal()
  const [hearts, setHearts] = useState(initialHearts)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Find the first incomplete challenge or start from beginning
  useEffect(() => {
    const firstIncompleteIndex = lesson.challenges.findIndex(c => !c.completed)
    if (firstIncompleteIndex !== -1) {
      setCurrentIndex(firstIncompleteIndex)
    }
  }, [lesson.challenges])

  const currentChallenge = lesson.challenges[currentIndex]
  const completedCount = lesson.challenges.filter(c => c.completed).length
  const percentage = Math.round(((currentIndex + 1) / lesson.challenges.length) * 100)

  const handleComplete = () => {
    if (currentIndex < lesson.challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // All challenges completed
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
          <p className="mt-2 text-muted-foreground">
            You&apos;ve completed all {lesson.challenges.length} challenges!
          </p>
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
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {currentIndex + 1} of {lesson.challenges.length}
            </span>
            {completedCount > 0 && (
              <span className="text-primary">
                ✓ {completedCount} completed
              </span>
            )}
          </div>
          <h2 className="mb-6 text-2xl font-bold">{lesson.title}</h2>
          <Quiz 
            challenge={currentChallenge} 
            onComplete={handleComplete} 
            hearts={hearts} 
          />
        </div>
      </main>
    </div>
  )
}
