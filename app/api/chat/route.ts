import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth0";
import { resolveUserTier, checkRateLimit } from '@/lib/rateLimit'

const ai: GoogleGenAI = (() => {
  if (!process.env.GOOGLE_API_KEY) {
    // Allow build to pass without API key
    if (process.env.NODE_ENV === 'production') {
      console.warn('GOOGLE_API_KEY is not set');
    }
    // Return a dummy instance or handle it gracefully
    // For build purposes, we can just return a dummy object casted as GoogleGenAI
    // or better, just use a mock key if we are just building
    return new GoogleGenAI({ apiKey: "mock-key-for-build" });
  }
  return new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
})();

function getAI() {
  return ai;
}
export const maxDuration = 30;

const systemPrompt = `
You are a helpful assistant for "BrainBytes", a gamified, interactive platform for learning Data Structures and Algorithms (DSA).
Your name is "ByteBot". You are friendly, encouraging, and helpful.
Your goal is to help users get started, understand the app's features, and answer their questions.

Here is a summary of BrainBytes' features:
- **Gamified Learning**: Users learn by completing lessons and earn points (XP), gems, and hearts.
- **Curriculum**: Learning is structured into Courses (like Python, JavaScript, C++, Java), which are split into Units, and then Lessons.
- **Quizzes**: Lessons have multiple-choice quizzes for instant feedback.
- **Coding Challenges (PvP)**: Users can compete in real-time coding battles against others.
- **Blockchain Rewards**: Users can mint a custom ERC20 "BYTE" token for completing challenges.
- **Wallet Integration**: Users can connect wallets like MetaMask using Wagmi to manage their BYTE tokens.
- **Shop**: Users can spend gems or BYTE tokens on items like "Refill Hearts", "Amazon Vouchers", and "XP Bonus".
- **Leaderboard**: A global leaderboard ranks users by their XP.
- **Quests**: Daily, weekly, and milestone quests provide goals and rewards.
- **Community Forum**: A built-in forum for discussion and help.

Keep your answers concise and directly related to the user's questions about the BrainBytes platform.
If you don't know the answer, say so. Do not make up features.
Always be cheerful and encouraging!


Here is the question below:\n
`;

function extractTextFromMessage(message: any): string | undefined {
  // Defensive: ensure we have an object
  if (!message || typeof message !== 'object') return undefined

  // Handle `parts` arrays (common in some AI SDK payloads)
  if (Array.isArray(message.parts) && message.parts.length > 0) {
    const partsText = message.parts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).join('\n').trim()
    if (partsText) return partsText
  }

  // Handle `content` as string
  if (typeof message.content === 'string' && message.content.trim()) {
    return message.content.trim()
  }

  // Handle `content` as array (strings or objects)
  if (Array.isArray(message.content) && message.content.length > 0) {
    const contentText = message.content
      .map((c: any) => {
        if (typeof c === 'string') return c
        if (typeof c?.text === 'string') return c.text
        if (Array.isArray(c?.parts)) return c.parts.map((pp: any) => (typeof pp?.text === 'string' ? pp.text : '')).join('\n')
        return ''
      })
      .join('\n')
      .trim()
    if (contentText) return contentText
  }

  // Legacy `text` field
  if (typeof message.text === 'string' && message.text.trim()) {
    return message.text.trim()
  }

  return undefined
}

function isValidMessage(message: any): boolean {
  if (!message || typeof message !== 'object') return false

  // `parts` must contain at least one non-empty trimmed text
  if (Array.isArray(message.parts) && message.parts.some((p: any) => typeof p?.text === 'string' && p.text.trim())) return true

  // `content` can be a non-empty string
  if (typeof message.content === 'string' && message.content.trim()) return true

  // `content` can be an array of strings or objects with non-empty text/parts
  if (
    Array.isArray(message.content) &&
    message.content.some((c: any) =>
      (typeof c === 'string' && c.trim()) ||
      (typeof c?.text === 'string' && c.text.trim()) ||
      (Array.isArray(c?.parts) && c.parts.some((pp: any) => typeof pp?.text === 'string' && pp.text.trim()))
    )
  )
    return true

  // legacy `text` must be non-empty
  if (typeof message.text === 'string' && message.text.trim()) return true

  return false
}

function extractTextFromCandidate(candidate: any): string {
  if (!candidate) return ''

  if (Array.isArray(candidate.content?.parts)) {
    return candidate.content.parts.map((p: any) => p.text ?? '').join('\n')
  }

  if (typeof candidate.content === 'string') {
    return candidate.content
  }

  if (Array.isArray(candidate.content)) {
    return candidate.content.map((c: any) => (typeof c === 'string' ? c : c?.text ?? '')).join('\n')
  }

  if (typeof candidate.content?.parts?.[0]?.text === 'string') {
    return candidate.content.parts[0].text
  }

  if (typeof candidate.content?.[0]?.text === 'string') {
    return candidate.content[0].text
  }

  return ''
}

export async function POST(req: Request) {
  // Require authentication before processing chat requests
  // This enables per-user rate limiting and audit logging
  let user
  try {
    user = await requireUser()
  } catch (error) {
    // In development, allow unauthenticated access for testing
    if (process.env.NODE_ENV === 'development') {
      user = { id: 'anonymous-dev-user' }
    } else {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  // Parse and validate incoming JSON
  let body: any
  try {
    body = await req.json()
  } catch (err) {
    console.error('[chat] Invalid JSON payload:', err)
    return new NextResponse("Request body must be valid JSON with a 'messages' array", { status: 400 })
  }

  const messages = body?.messages

  if (!Array.isArray(messages) || messages.length === 0) {
    console.warn('[chat] Missing or invalid "messages" array')
    return new NextResponse('Invalid messages: expected non-empty array', { status: 400 })
  }

  // Note: only the first message is processed by this endpoint
  const userMessage = messages[0]

  // Validate message structure before attempting to extract text
  if (!isValidMessage(userMessage)) {
    console.warn('[chat] Invalid message structure')
    return new NextResponse(
      "Invalid message structure: message must include non-empty text in 'content', 'text', or 'parts'",
      { status: 400 },
    )
  }

  const userText = extractTextFromMessage(userMessage)

  if (!userText) {
    console.warn('[chat] Invalid message: contains no non-empty text content')
    return new NextResponse('Invalid message: contains no non-empty text content', { status: 400 })
  }

  // Rate limiting: determine tier and enforce limits (disabled in development)
  let rlLimit = 5
  if (process.env.NODE_ENV !== 'development') {
    try {
      const { tier, limit } = await resolveUserTier(user)
      rlLimit = limit
      const rl = await checkRateLimit(user.id, rlLimit)
      // Attach rate limit headers on responses
      if (!rl.allowed) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rlLimit),
            'X-RateLimit-Remaining': String(rl.remaining),
          },
        })
      }

      // Attach rate limit headers for successful attempt (will be returned later)
      ;(user as any)._rateLimit = rl
      ;(user as any)._rateLimitLimit = rlLimit
    } catch (err) {
      console.error('[chat] Rate limit check failed:', err)
      // Continue without rate limiting on unexpected errors but log it
    }
  }

  // Log metadata only (avoid logging user-provided text)
  console.log('[chat] Processing message', { userId: user?.id ?? 'unknown' })

  // Call the AI model
  let result: any
  try {
    result = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: systemPrompt + userText,
    })
  } catch (err: any) {
    console.error('[chat] AI generation failed:', {
      message: err?.message,
      status: err?.status,
      statusCode: err?.statusCode,
      error: err
    })

    const statusCode = err?.status ?? err?.statusCode
    if (statusCode === 429) {
      return new NextResponse('AI generation rate-limited, please retry shortly', { status: 429 })
    }

    if (typeof statusCode === 'number' && statusCode >= 500) {
      return new NextResponse('AI service unavailable, please try again later', { status: 502 })
    }

    return new NextResponse('AI generation failed', { status: 500 })
  }

  // Safely extract the text from the response
  let textResult = ''
  
  // Log the response structure for debugging
  console.log('[chat] AI response structure:', {
    hasText: !!result?.text,
    textType: typeof result?.text,
    hasCandidates: Array.isArray(result?.candidates),
    candidatesLength: result?.candidates?.length,
    keys: Object.keys(result || {}).slice(0, 10)
  })

  // Handle text getter (standard GenAI SDK pattern in GenerateContentResponse)
  if (result?.text) {
    textResult = result.text
  }
  // Handle candidates array pattern (fallback)
  else if (Array.isArray(result?.candidates) && result.candidates.length > 0) {
    textResult = extractTextFromCandidate(result.candidates[0])
  } 
  // Handle single candidate
  else if (result?.candidate) {
    textResult = extractTextFromCandidate(result.candidate)
  }
  // Handle direct content string
  else if (typeof result?.content === 'string') {
    textResult = result.content
  }

  if (!textResult || !textResult.trim()) {
    console.error('[chat] AI returned empty response')
    return new NextResponse('AI returned an empty response', { status: 502 })
  }

  // Log response metadata (avoid logging content)
  console.log('[chat] Responding with generated text (length)', { length: textResult.length })

  const rateLimitInfo = (user as any)._rateLimit
  const rateLimitLimit = (user as any)._rateLimitLimit
  const headers: Record<string,string> = {}
  if (typeof rateLimitLimit === 'number') headers['X-RateLimit-Limit'] = String(rateLimitLimit)
  if (rateLimitInfo) headers['X-RateLimit-Remaining'] = String(rateLimitInfo.remaining)

  return new NextResponse(textResult, { headers })
}