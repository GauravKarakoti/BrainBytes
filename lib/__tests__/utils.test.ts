import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2', 'py-1')
    expect(result).toBe('px-2 py-1')
  })

  it('handles conditional classes', () => {
    const result = cn('px-2', true && 'py-1', false && 'mx-2')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
    expect(result).not.toContain('mx-2')
  })

  it('resolves tailwind conflicts correctly', () => {
    const result = cn('px-2', 'px-4')
    // The later class should override
    expect(result).toContain('px-4')
    expect(result).not.toContain('px-2')
  })

  it('handles empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles array of classes', () => {
    const result = cn(['px-2', 'py-1'])
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('handles objects with conditional classes', () => {
    const result = cn({
      'px-2': true,
      'py-1': false,
      'mx-1': true,
    })
    expect(result).toContain('px-2')
    expect(result).toContain('mx-1')
    expect(result).not.toContain('py-1')
  })
})
