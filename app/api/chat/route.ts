import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth0";

const ai = new GoogleGenAI({});

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

function extractTextFromMessage(first: any): string | undefined {
  // Defensive: ensure we have an object
  if (!first || typeof first !== 'object') return undefined

  // Handle `parts` arrays (common in some AI SDK payloads)
  if (Array.isArray(first.parts) && first.parts.length > 0) {
    const partsText = first.parts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).join('\n').trim()
    if (partsText) return partsText
  }

  // Handle `content` as string
  if (typeof first.content === 'string' && first.content.trim()) {
    return first.content.trim()
  }

  // Handle `content` as array (strings or objects)
  if (Array.isArray(first.content) && first.content.length > 0) {
    const contentText = first.content
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
  if (typeof first.text === 'string' && first.text.trim()) {
    return first.text.trim()
  }

  return undefined
}

function isValidMessage(first: any): boolean {
  if (!first || typeof first !== 'object') return false

  if (Array.isArray(first.parts) && first.parts.some((p: any) => typeof p?.text === 'string' && p.text.trim())) return true

  if (typeof first.content === 'string' && first.content.trim()) return true

  if (
    Array.isArray(first.content) &&
    first.content.some((c: any) =>
      typeof c === 'string' || typeof c?.text === 'string' || (Array.isArray(c?.parts) && c.parts.some((pp: any) => typeof pp?.text === 'string'))
    )
  )
    return true

  if (typeof first.text === 'string' && first.text.trim()) return true

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
  // This prevents unauthorized API usage and enables rate limiting per user
  await requireUser()

  // Parse and validate incoming JSON
  let body: any
  try {
    body = await req.json()
  } catch (err) {
    console.error('[chat] Invalid JSON payload:', err)
    return new NextResponse('Invalid JSON payload', { status: 400 })
  }

  const messages = body?.messages

  if (!Array.isArray(messages) || messages.length === 0) {
    console.warn('[chat] Missing or invalid "messages" array')
    return new NextResponse('Invalid messages: expected non-empty array', { status: 400 })
  }

  const first = messages[0]

  // Validate message structure before attempting to extract text
  if (!isValidMessage(first)) {
    console.warn('[chat] Invalid message structure', { sample: first })
    return new NextResponse('Invalid message structure', { status: 400 })
  }

  const userText = extractTextFromMessage(first)

  if (!userText) {
    console.warn('[chat] No message text found in the provided message structure')
    return new NextResponse('No message text found', { status: 400 })
  }

  console.log('Messages text:', userText)

  // Call the AI model
  let result: any
  try {
    result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt + userText,
    })
  } catch (err) {
    console.error('[chat] AI generation failed:', err)
    return new NextResponse('AI generation failed', { status: 500 })
  }

  // Safely extract the text from the response
  let textResult = ''
  if (Array.isArray(result?.candidates) && result.candidates.length > 0) {
    textResult = extractTextFromCandidate(result.candidates[0])
  } else if (result?.candidate) {
    textResult = extractTextFromCandidate(result.candidate)
  } else if (typeof result?.content === 'string') {
    textResult = result.content
  }

  console.log('Result:', textResult)

  return new NextResponse(textResult)
}