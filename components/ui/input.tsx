'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-[1.25rem] border border-outline/25 bg-surface px-4 py-2 text-base text-foreground shadow-[0_1px_2px_hsla(var(--shadow-color)_/_0.08),0_0_1px_hsla(var(--shadow-color)_/_0.28)] transition-all placeholder:text-muted-foreground/70 focus-visible:border-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
