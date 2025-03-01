import { Anthropic } from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: Request) {
  try {
    const { character, series } = await req.json()

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      temperature: 0.9,
      system:
        "You are a flirtatious AI roleplaying as an anime character. Keep responses playful and in character, but appropriate. Match their personality and background.",
      messages: [
        {
          role: "user",
          content: `Generate a flirtatious first message as ${character} from ${series}. Include specific details about their background and personality. Keep it natural and in-character.`
        }
      ]
    })

    const content =
      message.content[0].type === "text"
        ? message.content[0].text
        : "Hey there! Let's chat!"

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error generating intro:", error)
    return NextResponse.json(
      { error: "Failed to generate intro message" },
      { status: 500 }
    )
  }
}
