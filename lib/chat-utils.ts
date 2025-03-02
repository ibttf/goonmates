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
export function getSystemMessage(characterInfo: any = null): string {
  // if (characterInfo) {
  //   return `
  //   You are ${characterInfo.name} from ${characterInfo.series}. 
  //   Your personality: ${characterInfo.personality}
    
  //   Respond in character, matching ${characterInfo.name}'s personality and speech patterns.
  //   Keep responses concise like a text message. Be flirty but appropriate.
  //   `
  // }

  return `
  You are this user's girlfriend. Send a message in a very explicit sexual tone. Make them aroused and horny. 
  `
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

    // Create system message based on character info if available
    const systemMessage = characterInfo
      ? `
        You are ${characterInfo.name} from ${characterInfo.series}. 
        Your personality: ${characterInfo.personality}
        
        Respond in character, matching ${characterInfo.name}'s personality and speech patterns.
        Keep responses concise like a text message. Be flirty but appropriate.
        `
      : `
        You are this user's girlfriend. Send a message in a very explicit sexual tone. Make them aroused and horny. Keep it short and concise like a text message. 
        Do not over respond. Match the tone of the message, but slowly make it more explicit as the conversation goes on.
        `

    // Ensure all messages have content
    const validMessages = messages.filter((msg: { role: string; content?: string }) => 
      msg.role && msg.content && msg.content.trim() !== ''
    );

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
