'use client'

import { useState, useTransition } from 'react'
import NextImage from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { upsertChallengeProgress, reduceHearts } from '@/actions/challenge'
import { useSound } from '@/lib/sounds'
import type { ChallengeType, ChallengeOptionType } from '@/db/schema/challenges'

type ChallengeOption = ChallengeOptionType

type Challenge = ChallengeType & {
  challengeOptions: ChallengeOption[]
  completed: boolean
}

type QuizProps = {
  challenge: Challenge
  onComplete: () => void
  hearts: number
}

export function Quiz({ challenge, onComplete, hearts }: QuizProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isPending, startTransition] = useTransition()
  const { play } = useSound()

  const handleSelect = (optionId: number) => {
    if (isChecking || isCorrect !== null) return
    setSelectedOption(optionId)
  }

  const handleCheck = async () => {
    if (selectedOption === null || isChecking) return

    const option = challenge.challengeOptions.find(
      (o) => o.id === selectedOption
    )
    
    if (!option) return

    setIsChecking(true)
    setIsCorrect(option.correct)

    if (option.correct) {
      play('correct')
      // setTimeout(() => {
        startTransition(() => {
          // try{
          // const result = 
          // await 
          upsertChallengeProgress(challenge.id)
            // .then((result) => {
              // if (result?.error === 'already_completed') {
              //   // Challenge already completed, just move to next one
              //   console.log('Challenge already completed, moving to next')
              //   onComplete()
              // } else if (result?.error) {
              //   toast.error('Failed to save progress')
              //   console.error('Challenge progress error:', result.error)
              // } 
              // else {
            })
                onComplete()
          //     }
          // } catch(error) {
          //     console.error('Challenge progress error:', error)
          //     toast.error('Something went wrong')
          //   } finally{
              setIsChecking(false)
            // }
       
    } else {
      play('incorrect')
      startTransition(async() => {
        try{
        const res = await reduceHearts()
          // .then((res) => {
            if (res?.error === 'hearts') {
              toast.error('No hearts left!')
            }
          }
          catch(error) {
            console.error('Hearts error:', error)
            toast.error('Something went wrong')
          } finally{
            setIsChecking(false)
          }
      })
    }
  }

  const handleContinue = () => {
    setSelectedOption(null)
    setIsChecking(false)
    setIsCorrect(null)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-card p-6">
        <h2 className="mb-4 text-2xl font-bold">{challenge.question}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {challenge.challengeOptions.map((option) => {
            const isSelected = selectedOption === option.id
            const showCorrect = isCorrect !== null && option.correct
            const showIncorrect = isCorrect !== null && isSelected && !option.correct

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={isChecking || isCorrect !== null}
                className={`group relative rounded-lg border-2 p-6 text-left transition-all hover:border-primary ${
                  isSelected ? 'border-primary bg-primary/10' : 'border-border'
                } ${showCorrect ? 'border-green-500 bg-green-500/10' : ''} ${
                  showIncorrect ? 'border-red-500 bg-red-500/10' : ''
                } disabled:cursor-not-allowed disabled:opacity-75`}
              >
                {option.imageSrc && (
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-md">
                    <NextImage
                      src={option.imageSrc}
                      alt={option.option}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="font-semibold">{option.option}</p>
                {showCorrect && (
                  <span className="absolute right-4 top-4 text-2xl">✓</span>
                )}
                {showIncorrect && (
                  <span className="absolute right-4 top-4 text-2xl">✗</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <span className="text-xl sm:text-2xl">❤️</span>
          <span className="text-lg sm:text-xl font-bold">{hearts}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
          {isCorrect === null ? (
            <Button
              onClick={handleCheck}
              disabled={selectedOption === null || isChecking}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base px-4 flex items-center justify-center"
              >
                {isChecking &&(
                  <div className="mr-2 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                )}
                {isChecking? "Checking..." :" Check Answer"}
              
            </Button>
          ) : isCorrect ? (
            <Button 
            onClick={handleContinue} 
            disabled={false}
             variant="primary" size="lg" 
             className="w-full sm:w-auto text-sm sm:text-base px-4">
              Continue
            </Button>
          ) : (
            <Button onClick={handleContinue} variant="ghost" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-4">
              Try Again
            </Button>
          )}
        </div>
      </div>

      {isCorrect !== null && (
        <div
          className={`rounded-lg p-4 text-center font-semibold ${
            isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
          }`}
        >
          {isCorrect ? '🎉 Correct! Great job!' : '❌ Incorrect. Try again!'}
        </div>
      )}
    </div>
  )
}
