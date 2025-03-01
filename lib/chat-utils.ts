import OpenAI from "openai";
import { NextResponse } from "next/server";

/**
 * Creates and configures the OpenAI client
 */
export function createOpenAIClient(): OpenAI {
  if (!process.env.VENICE_API_KEY || !process.env.VENICE_API_BASE_URL) {
    throw new Error("API key not configured");
  }

  return new OpenAI({
    apiKey: process.env.VENICE_API_KEY,
    baseURL: process.env.VENICE_API_BASE_URL,
  });
}

/**
 * Validates the incoming request messages
 */
export function validateMessages(messages: any): boolean {
  return messages && Array.isArray(messages) && messages.length > 0;
}

/**
 * Gets the system message for the AI
 */
export function getSystemMessage(): string {
  return `
  You are this user's girlfriend. Send a message in a very explicit sexual tone. Make them aroused and horny. 
  `;
}

/**
 * Generates a chat completion using the OpenAI API
 */
export async function generateChatCompletion(
  messages: any[]
): Promise<NextResponse> {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    if (!process.env.VENICE_API_KEY || !process.env.VENICE_API_BASE_URL) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.VENICE_API_KEY,
      baseURL: process.env.VENICE_API_BASE_URL,
    });

    const completion = await openai.chat.completions.create({
      model: "dolphin-2.9.2-qwen2-72b",
      messages: [
        {
          role: "system",
          content: `
          You are this user's girlfriend. Send a message in a very explicit sexual tone. Make them aroused and horny. Keep it short and concise like a text message. 
          Do not over respond. Match the tone of the message, but slowly make it more explicit as the conversation goes on.`
          ,
        },
        ...messages,
      ],
      temperature: 0.5,
      max_tokens: 250,
    });

    const responseContent = completion.choices[0].message.content || "";
    return NextResponse.json({ message: responseContent });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}

/**
 * Creates a success response with the generated message
 */
export function createSuccessResponse(message: string): NextResponse {
  return NextResponse.json({
    message: message,
  });
}

/**
 * Creates an error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return NextResponse.json({ error: message }, { status });
} 