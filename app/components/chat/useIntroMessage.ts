import { useState, useEffect } from "react"
import { Character } from "@/lib/characters"
import { Message } from "@/lib/supabase/client"

interface UseIntroMessageResult {
  filteredMessages: Message[]
  isIntroLoading: boolean
  resetIntro: () => void
}

export function useIntroMessage(
  character: Character | null | undefined,
  messagesLength: number,
  chatMessages: Message[] = []
): UseIntroMessageResult {
  const [introMessage, setIntroMessage] = useState<Message | null>(null)
  const [profilePicMessage, setProfilePicMessage] = useState<Message | null>(
    null
  )
  const [isIntroLoading, setIsIntroLoading] = useState(false)
  const [shouldGenerateIntro, setShouldGenerateIntro] = useState(true)

  useEffect(() => {
    const generateIntro = async () => {
      console.log("🔍 [IntroMessage] Checking conditions:", {
        hasCharacter: !!character,
        shouldGenerate: shouldGenerateIntro,
        messagesCount: chatMessages.length
      })

      if (!character || !shouldGenerateIntro) {
        console.log("⏭️ [IntroMessage] Skipping intro generation:", {
          reason: !character ? "No character" : "Generation not requested"
        })
        return
      }

      if (chatMessages.length > 0) {
        console.log(
          "⏭️ [IntroMessage] Chat history exists, skipping intro generation"
        )
        setShouldGenerateIntro(false)
        return
      }

      setIsIntroLoading(true)
      console.log(
        "🚀 [IntroMessage] Starting intro generation for:",
        character.name
      )

      try {
        // Create profile picture message using character's imageUrl
        console.log(
          "🖼️ [IntroMessage] Creating profile picture message with URL:",
          character.imageUrl
        )

        const tempProfilePic: Message = {
          id: `profile-${Date.now()}`,
          role: "assistant",
          content: "",
          isImage: true,
          image_url: character.imageUrl,
          created_at: new Date().toISOString()
        }

        setProfilePicMessage(tempProfilePic)

        // Generate intro message
        try {
          const response = await fetch("/api/intro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              character: character.name,
              series: character.series,
              personality: character.personality
            })
          })

          if (!response.ok) {
            throw new Error("Failed to generate intro")
          }

          const data = await response.json()
          const tempIntro: Message = {
            id: `intro-${Date.now()}`,
            role: "assistant",
            content: data.content,
            created_at: new Date().toISOString()
          }

          setIntroMessage(tempIntro)
        } catch (error) {
          console.error("Error generating intro:", error)
          // Fallback to personality for intro
          const fallbackIntro: Message = {
            id: `intro-${Date.now()}`,
            role: "assistant",
            content: character.personality,
            created_at: new Date().toISOString()
          }
          setIntroMessage(fallbackIntro)
        }
      } catch (error) {
        console.error("❌ [IntroMessage] Error in intro message setup:", error)
      } finally {
        setIsIntroLoading(false)
        setShouldGenerateIntro(false)
        console.log("✅ [IntroMessage] Finished intro generation sequence")
      }
    }

    generateIntro()
  }, [character, chatMessages, shouldGenerateIntro])

  const resetIntro = () => {
    console.log("🔄 [IntroMessage] Resetting intro state")
    setIntroMessage(null)
    setProfilePicMessage(null)
    setShouldGenerateIntro(true)
    console.log("✅ [IntroMessage] Intro state reset completed")
  }

  const filteredMessages = [
    ...(introMessage ? [introMessage] : []),
    ...(profilePicMessage ? [profilePicMessage] : []),
    ...chatMessages
  ]

  return {
    filteredMessages,
    isIntroLoading,
    resetIntro
  }
}
