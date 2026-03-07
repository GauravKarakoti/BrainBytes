import { describe, it, expect, vi, beforeEach } from 'vitest'
import { savewallet_address } from '@/actions/saveWallet'
import { db } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { requireUser } from '@/lib/auth0'
import { ethers } from 'ethers'

// Mock dependencies
vi.mock('@/db/drizzle', () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}))

vi.mock('@/lib/auth0', () => ({
  requireUser: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('ethers', () => ({
  ethers: {
    isAddress: vi.fn(),
  },
}))

describe('savewallet_address', () => {
  const mockUser = { id: 'user123' }
  const validWalletAddress = '0x1234567890123456789012345678901234567890'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireUser).mockResolvedValue(mockUser)
  })

  it('should return success when wallet address is saved successfully', async () => {
    vi.mocked(ethers.isAddress).mockReturnValue(true)
    const mockWhere = vi.fn().mockResolvedValue(undefined)
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: mockWhere,
      }),
    } as any)

    const result = await savewallet_address(validWalletAddress)

    expect(result).toEqual({
      success: true,
      wallet_address: validWalletAddress,
    })
  })

  it('should return error for invalid wallet address', async () => {
    vi.mocked(ethers.isAddress).mockReturnValue(false)
    const invalidAddress = 'invalid-address'

    const result = await savewallet_address(invalidAddress)

    expect(result).toEqual({ error: 'Invalid wallet address' })
  })

  it('should return user-friendly error for duplicate wallet address', async () => {
    vi.mocked(ethers.isAddress).mockReturnValue(true)
    const duplicateError = new Error('duplicate key value violates unique constraint "user_progress_wallet_address_key"')
    ;(duplicateError as any).code = '23505'

    const mockWhere = vi.fn().mockRejectedValue(duplicateError)
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: mockWhere,
      }),
    } as any)

    const result = await savewallet_address(validWalletAddress)

    expect(result).toEqual({
      error: 'This wallet is already connected to another account',
    })
  })

  it('should return generic error for other database errors', async () => {
    vi.mocked(ethers.isAddress).mockReturnValue(true)
    const otherError = new Error('Some other database error')

    const mockWhere = vi.fn().mockRejectedValue(otherError)
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: mockWhere,
      }),
    } as any)

    const result = await savewallet_address(validWalletAddress)

    expect(result).toEqual({ error: 'Failed to save wallet address' })
  })
})
