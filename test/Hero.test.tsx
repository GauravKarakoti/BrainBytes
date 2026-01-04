import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

// Mock the auth0 useUser hook
vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({ user: null, isLoading: false }),
}))

import { Hero } from '@/components/landing/Hero'

describe('Hero component', () => {
  it('renders call-to-action when user is not authenticated', () => {
    render(<Hero />)

    // Look for the 'Get started' button text
    const cta = screen.getByRole('link', { name: /get started/i })
    expect(cta).toBeInTheDocument()
  })
})
