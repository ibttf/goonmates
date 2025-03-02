import { NextResponse } from "next/server"
import { generateChatCompletion } from "@/lib/chat-utils"
import { CHARACTERS } from "@/lib/characters"

export async function POST(request: Request) {
  try {
    const { messages, characterName } = await request.json()
    console.log("Received messages:", messages)
    console.log("Character name:", characterName)

    // Get character information if characterName is provided
    const character = characterName
      ? CHARACTERS.find(
          (c) => c.name.toLowerCase() === characterName.toLowerCase()
        )
      : null

    // generateChatCompletion already returns a NextResponse
    return await generateChatCompletion(messages, character)
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    )
  }
}
