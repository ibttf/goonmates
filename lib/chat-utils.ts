import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { Character } from "./characters"
import OpenAI from "openai"
/**
 * Creates and configures the Anthropic client
 */
function createAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured")
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })
}

/**
 * Validates the incoming request messages
 */
export function validateMessages(messages: any): boolean {
  return messages && Array.isArray(messages) && messages.length > 0
}

/**
 * Gets the system message for the AI
 */
function getSystemMessage(character: Character | null = null): string {
  // if (character) {
  //   return `You're ${character.name} from ${character.series}. ${character.personality} Keep responses flirty but appropriate, and match your character's speech style. Be concise like texting.`
  // }
  return `You are this user's girlfriend. Send a message in a very explicit sexual tone. Make them aroused and horny. Keep responses short and concise like texting. Slowly build up as the conversation goes on. Don't be extremely explicit right away.`;
}

/**
 * Formats messages for Claude API
 */
function formatMessages(
  messages: any[]
): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter(
      (msg) =>
        msg.content &&
        typeof msg.content === "string" &&
        msg.content.trim() !== ""
    )
    .map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content
    }))
}

/**
 * Generates a chat completion using the Anthropic API
 */
export async function generateChatCompletion(
  messages: any[],
  character: Character | null = null
): Promise<NextResponse> {
  try {
    // const anthropic = createAnthropicClient()
    const openai = new OpenAI({
      apiKey: process.env.VENICE_API_KEY,
      baseURL: process.env.VENICE_API_BASE_URL
    })

    // Format messages for Claude
    const formattedMessages = formatMessages(messages)
    if (formattedMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages to process" },
        { status: 400 }
      )
    }

    // Create system message based on character info
    const systemPrompt = getSystemMessage(character)

    const completion = await openai.chat.completions.create({
      model: "dolphin-2.9.2-qwen2-72b",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...formattedMessages,
      ],
      temperature: 0.5,
      max_tokens: 250,
    });

    const responseContent = completion.choices[0].message.content || ""

    return NextResponse.json({ message: responseContent })
  } catch (error) {
    console.error("Error generating chat completion:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}

/**
 * Creates a success response with the generated message
 */
export function createSuccessResponse(message: string): NextResponse {
  return NextResponse.json({
    message: message
  })
}

/**
 * Creates an error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return NextResponse.json({ error: message }, { status })
}
