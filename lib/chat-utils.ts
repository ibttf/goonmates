import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { Character } from "./characters"

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
  if (character) {
    return `You're ${character.name} from ${character.series}. ${character.personality} Keep responses flirty but appropriate, and match your character's speech style. Be concise like texting.`
  }

  return `You're a flirty girlfriend having a fun chat. Keep it spicy but tasteful. Be concise like texting.`
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
    const anthropic = createAnthropicClient()

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

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: formattedMessages
    })

    // Extract the response content, ensuring it's a text block
    const content = response.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude")
    }

    return NextResponse.json({ message: content.text })
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
