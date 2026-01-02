import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth0";
import { z } from "zod";
import { checkRateLimit, getUserTier } from "@/lib/rate-limiter";

const ai = new GoogleGenAI({});

export const maxDuration = 30;

// Validation schema for chat message request
const ChatMessageSchema = z.object({
  parts: z.array(
    z.object({
      text: z.string().min(1, "Message text cannot be empty"),
    })
  ).min(1, "Message must have at least one part"),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1, "Messages array cannot be empty"),
});

type ChatRequest = z.infer<typeof ChatRequestSchema>;

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

export async function POST(req: Request) {
  try {
    // Require authentication before processing chat requests
    // This prevents unauthorized API usage and enables rate limiting per user
    let user;
    try {
      user = await requireUser();
    } catch (authError) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check rate limit for user
    const userTier = getUserTier(user.sub);
    const rateLimitResult = checkRateLimit(user.sub, userTier);

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': String(rateLimitResult.remaining + 1), // Include current request
      'X-RateLimit-Remaining': String(Math.max(0, rateLimitResult.remaining)),
      'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000)),
    };

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Please try again after ${rateLimitResult.retryAfter} seconds.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': String(rateLimitResult.retryAfter),
          },
        }
      );
    }

    // Parse and validate request body
    let requestData: unknown;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400, headers }
      );
    }

    // Validate against schema
    const validationResult = ChatRequestSchema.safeParse(requestData);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");
      return NextResponse.json(
        { error: "Invalid request structure", details: errorMessages },
        { status: 400, headers }
      );
    }

    const { messages } = validationResult.data as ChatRequest;
    const userMessage = messages[0].parts[0].text;

    console.log("User:", user.sub);
    console.log("Tier:", userTier);
    console.log("Remaining requests:", rateLimitResult.remaining);
    console.log("Messages:", userMessage);

    // Check if AI service is available
    if (!ai || !ai.models) {
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503, headers }
      );
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt + userMessage,
    });

    const textResult = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResult) {
      return NextResponse.json(
        { error: "No response generated from AI" },
        { status: 502, headers }
      );
    }

    console.log("Result:", textResult);

    return new NextResponse(textResult, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "text/plain",
      }
    });
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Return more specific error messages based on error type
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to generate chat response" },
      { status: 500 }
    );
  }
}
