import React from 'react'
import { render, screen } from '@testing-library/react'
import LearnLoading from '@/app/(user)/(dashboard)/@main/learn/loading'

describe('LearnLoading', () => {
  it('renders skeleton placeholders for learn page', () => {
    render(<LearnLoading />)

    // Check for skeleton elements with animate-pulse class
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(10)
  })

  it('renders correct number of unit skeletons', () => {
    render(<LearnLoading />)

    // Each unit has: banner (3 skeletons) + 5 lesson buttons = 8 skeletons per unit
    // 3 units = 24 skeletons + header (2) = 26 total skeleton elements
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBe(26)
  })
})
