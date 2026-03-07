// @vitest-environment jsdom
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock the auth0 useUser hook before importing the component
vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({ user: null, isLoading: false }),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

import { Hero } from '@/components/landing/Hero'

describe('Hero component', () => {
  it('renders call-to-action when user is not authenticated', () => {
    render(<Hero />)

    // Look for the 'Get started' button/link text
    const cta = screen.getByRole('link', { name: /get started/i })
    expect(cta).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    render(<Hero />)

    // Check for the main heading text
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('contains a link to get started', () => {
    render(<Hero />)

    const link = screen.getByRole('link', { name: /get started/i })
    expect(link).toHaveAttribute('href')
  })
})
