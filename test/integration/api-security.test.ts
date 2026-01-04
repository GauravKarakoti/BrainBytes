import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    cache: (fn: any) => fn,
  }
})

import { GET as getUserProfile } from '@/app/api/user/profile/route'
import { POST as postChat } from '@/app/api/chat/route'
import { GET as getCron } from '@/app/api/cron/route'
import * as auth0 from '@auth0/nextjs-auth0'
import { getDb } from '@/db/drizzle'

// Mock dependencies
vi.mock('@auth0/nextjs-auth0', () => ({
  getSession: vi.fn()
}))

vi.mock('@/db/drizzle', () => ({
  getDb: vi.fn()
}))

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => 'Mock AI response' }
      })
    })
  }))
}))

vi.mock('@/actions/quest', () => ({
  resetDailyQuests: vi.fn(),
  resetWeeklyQuests: vi.fn()
}))

vi.mock('@/lib/rateLimit', () => ({
  resolveUserTier: vi.fn().mockResolvedValue({ tier: 'Free', limit: 10 }),
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 9 })
}))

const mockHeaders = new Map()
vi.mock('next/headers', () => ({
  headers: vi.fn().mockImplementation(() => ({
    get: (key: string) => mockHeaders.get(key.toLowerCase())
  }))
}))

// Mock DB structure
const mockDb = {
  query: {
    userProgress: {
      findFirst: vi.fn()
    }
  }
}

describe('API Security Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDb).mockReturnValue(mockDb as any)
  })

  describe('GET /api/user/profile', () => {
    it('Should return 401/403 for unauthenticated requests', async () => {
      vi.mocked(auth0.getSession).mockResolvedValue(null)
      
      const response = await getUserProfile()
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/chat', () => {
    it('Should fail without a valid session', async () => {
      vi.mocked(auth0.getSession).mockResolvedValue(null)
      
      const req = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [] })
      })
      
      const response = await postChat(req)
      expect(response.status).toBe(401)
    })

    it('Should succeed with a valid mock session', async () => {
      vi.mocked(auth0.getSession).mockResolvedValue({
        user: { sub: 'user-1', name: 'Test User', email: 'test@example.com', picture: 'pic.jpg' }
      } as any)

      const req = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] })
      })

      const response = await postChat(req)
      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/cron', () => {
    it('Should fail without the correct Bearer token', async () => {
      mockHeaders.set('authorization', 'Bearer wrong-token')
      const req = new Request('http://localhost/api/cron', {
        headers: { Authorization: 'Bearer wrong-token' }
      })
      
      const response = await getCron(req)
      expect(response.status).toBe(401)
    })
  })
})
