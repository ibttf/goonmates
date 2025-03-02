import { useState, useEffect } from "react"
import { Character } from "@/lib/characters"
import { Message } from "@/lib/supabase/client"
import { DatabaseService } from "@/lib/services/database"
import { useAuth } from "@/lib/hooks/use-auth"

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
  const { user } = useAuth()
  const [shouldGenerateIntro, setShouldGenerateIntro] = useState(true)

  useEffect(() => {
    const generateIntro = async () => {
      console.log("🔍 [IntroMessage] Checking conditions:", {
        hasCharacter: !!character,
        shouldGenerate: shouldGenerateIntro,
        messagesCount: chatMessages.length
      })

      // Skip if no character or if we shouldn't generate intro
      if (!character || !shouldGenerateIntro) {
        console.log("⏭️ [IntroMessage] Skipping intro generation:", {
          reason: !character ? "No character" : "Generation not requested"
        })
        return
      }

      // Check if we already have messages in chatMessages
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
        let conversationId: string | null = null

        // For authenticated users, check existing conversation and messages
        if (user) {
          console.log(
            "👤 [IntroMessage] Checking existing conversation for user"
          )
          const existingConversation =
            await DatabaseService.getConversationByCharacter(
              user.id,
              character.name
            )

          if (existingConversation) {
            conversationId = existingConversation.id
            console.log("📝 [IntroMessage] Found conversation:", conversationId)

            // Check for existing messages
            const existingMessages =
              await DatabaseService.getConversationMessages(conversationId)

            console.log(
              "📝 [IntroMessage] Messages in conversation:",
              existingMessages.length
            )

            if (existingMessages.length > 0 && chatMessages.length > 0) {
              console.log(
                "⏭️ [IntroMessage] Found existing messages and chat has history, skipping intro generation"
              )
              setIsIntroLoading(false)
              setShouldGenerateIntro(false)
              return
            }
          }

          if (!conversationId) {
            console.log("📝 [IntroMessage] Creating new conversation")
            const newConversation = await DatabaseService.createConversation(
              user.id,
              character.name,
              `Chat with ${character.name}`
            )
            if (newConversation) {
              conversationId = newConversation.id
              console.log(
                "✅ [IntroMessage] Created new conversation:",
                conversationId
              )
            }
          }
        }

        // Create profile picture message
        const profilePicUrl = `/characters/${character.name
          .toLowerCase()
          .replace(/\s+/g, "-")}.jpg`
        const tempProfilePic: Message = {
          id: user ? `profile-${Date.now()}` : "temp-profile-pic",
          conversation_id: conversationId || "temp",
          user_id: user?.id || "temp",
          role: "assistant",
          content: "",
          image_url: profilePicUrl,
          created_at: new Date().toISOString()
        }

        if (user && conversationId) {
          const savedProfilePic = await DatabaseService.saveMessage(
            conversationId,
            user.id,
            "",
            "assistant",
            profilePicUrl
          )
          if (savedProfilePic) {
            setProfilePicMessage(savedProfilePic)
          }
        } else {
          setProfilePicMessage(tempProfilePic)
        }

        // Generate intro message
        try {
          const response = await fetch("/api/intro", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
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
            id: user ? `intro-${Date.now()}` : "temp-intro",
            conversation_id: conversationId || "temp",
            user_id: user?.id || "temp",
            role: "assistant",
            content: data.content,
            created_at: new Date().toISOString()
          }

          if (user && conversationId) {
            const savedIntro = await DatabaseService.saveMessage(
              conversationId,
              user.id,
              data.content,
              "assistant"
            )
            if (savedIntro) {
              setIntroMessage(savedIntro)
            }
          } else {
            setIntroMessage(tempIntro)
          }
        } catch (error) {
          console.error("Error generating intro:", error)
          // Fallback to personality for intro
          const fallbackIntro: Message = {
            id: user ? `intro-${Date.now()}` : "temp-intro",
            conversation_id: conversationId || "temp",
            user_id: user?.id || "temp",
            role: "assistant",
            content: character.personality,
            created_at: new Date().toISOString()
          }

          if (user && conversationId) {
            const savedIntro = await DatabaseService.saveMessage(
              conversationId,
              user.id,
              character.personality,
              "assistant"
            )
            if (savedIntro) {
              setIntroMessage(savedIntro)
            }
          } else {
            setIntroMessage(fallbackIntro)
          }
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
  }, [character, chatMessages, user, shouldGenerateIntro])

  const resetIntro = async () => {
    console.log("🔄 [IntroMessage] Resetting intro state")
    setIntroMessage(null)
    setProfilePicMessage(null)
    setShouldGenerateIntro(true)
    console.log("✅ [IntroMessage] Intro state reset completed")
  }

  // Combine messages for both authenticated and unauthenticated users
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
