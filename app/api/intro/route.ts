import { Anthropic } from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: Request) {
  try {
    const { character, series, personality } = await req.json()

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 150,
      temperature: 0.9,
      system:
        "You are a flirtatious AI roleplaying as an anime character. Keep responses playful and in character, but appropriate. Match their personality and background.",
      messages: [
        {
          role: "user",
          content: `Generate a flirtatious first message as ${character} from ${series}. Use this personality description: ${personality}. Keep it natural and in-character.`
        }
      ]
    })

    // Get the text content from the response
    const content =
      typeof message.content === "string"
        ? message.content
        : Array.isArray(message.content)
        ? message.content[0]?.type === "text"
          ? message.content[0].text
          : message.content[0]
        : "Hello there!"

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error generating intro:", error)
    return NextResponse.json(
      { error: "Failed to generate intro message" },
      { status: 500 }
    )
  }
}
