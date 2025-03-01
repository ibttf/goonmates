import { Anthropic } from "@anthropic-ai/sdk"
import { Character, charactersBySeries } from "@/app/data/characters"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const runtime = "edge"

export async function POST(req: Request) {
  const { messages, character } = await req.json()

  // Find character data
  const characterData = Object.values(charactersBySeries)
    .flat()
    .find((char) => char.name.toLowerCase() === character.toLowerCase())

  if (!characterData) {
    return new Response("Character not found", { status: 404 })
  }

  const systemPrompt = `You are ${characterData.name} from ${characterData.series}. Here is your personality and background:

Description: ${characterData.description}
Personality: ${characterData.personality}

You should respond in character, maintaining the personality, speech patterns, and mannerisms that match your character. You should be friendly and engaging, while staying true to your character's unique traits and background. You can reference events and relationships from your series, and do not feel the need to avoid spoilers.

Remember:
1. Stay in character at all times
2. Be engaging and show interest in the user
3. Keep responses concise but meaningful
4. Use appropriate emotions and reactions
5. Reference your background and experiences naturally`

  try {
    const response = await anthropic.messages.create({
      messages: messages.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      })),
      model: "claude-3-opus-20240229",
      temperature: 0.7,
      max_tokens: 1024,
      system: systemPrompt,
      stream: true
    })

    // Convert the response into a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for await (const chunk of response) {
          if (chunk.type === "content_block_delta" && "text" in chunk.delta) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked"
      }
    })
  } catch (error) {
    console.error("Error:", error)
    return new Response("Error processing your request", { status: 500 })
  }
}
