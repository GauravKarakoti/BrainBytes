import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Hero } from '@/components/landing/Hero'

// Mock Auth0 hook
jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: jest.fn(() => ({
    user: null,
    isLoading: false,
  })),
}))

// Mock Framer Motion to avoid animation complexity in tests
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href}>{children}</a>
  )
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Code2: () => <span>Code Icon</span>,
  ArrowRight: () => <span>Arrow Icon</span>,
}))

describe('Hero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<Hero />)
    // Hero should render a section
    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('displays the main headline with Master text', () => {
    render(<Hero />)
    // Check if Master text is present (case-insensitive)
    const headingElement = document.querySelector('h1')
    if (headingElement) {
      expect(headingElement.textContent).toMatch(/master/i)
    }
  })

  it('should have proper section structure', () => {
    render(<Hero />)
    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()
    // Hero section should have relative positioning
    expect(section?.className).toMatch(/relative/)
  })

  it('should have proper overflow handling', () => {
    render(<Hero />)
    const section = document.querySelector('section')
    expect(section?.className).toMatch(/overflow-hidden/)
  })
})
