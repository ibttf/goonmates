import { useState, useEffect } from "react"
import { Character } from "@/lib/characters"
import { Message } from "./MessageItem"

interface UseIntroMessageResult {
  filteredMessages: Message[];
  customMessages: Message[];
  isIntroLoading: boolean;
  resetIntro: () => void;
}

export function useIntroMessage(
  character: Character | null | undefined, 
  messagesLength: number,
  chatMessages: Message[] = []
): UseIntroMessageResult {
  const [customMessages, setCustomMessages] = useState<Message[]>([])
  const [isIntroLoading, setIsIntroLoading] = useState(false)
  const [hasShownIntro, setHasShownIntro] = useState(false)

  useEffect(() => {
    let mounted = true

    const generateIntro = async () => {
      console.log("Generating intro:", {
        mounted,
        character,
        messagesLength,
        hasShownIntro
      })

      if (!mounted || !character || messagesLength > 0 || hasShownIntro) {
        console.log("Skipping intro generation due to:", {
          mounted,
          hasCharacter: !!character,
          messagesLength,
          hasShownIntro
        })
        return
      }

      setIsIntroLoading(true)
      const loadingMessage: Message = {
        role: "assistant",
        content: "...",
        id: "intro-loading",
        createdAt: new Date()
      }
      
      setCustomMessages([loadingMessage])

      try {
        console.log("Fetching intro for:", character.name)
        const response = await fetch("/api/intro", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            character: character.name,
            series: character.series
          })
        })

        if (!response.ok) {
          throw new Error("Failed to generate intro")
        }

        const data = await response.json()
        console.log("Received intro data:", data)

        if (mounted) {
          const introMessage: Message = {
            role: "assistant",
            content: data.content,
            id: "intro",
            createdAt: new Date()
          }

          console.log("Setting custom messages:", [introMessage])
          setCustomMessages([introMessage])
        }
      } catch (error) {
        console.error("Error generating intro:", error)
        if (mounted) {
          const fallbackMessage: Message = {
            role: "assistant",
            content: `Hey! I'm ${character.name} from ${character.series}. Let's chat! 😊`,
            id: "intro",
            createdAt: new Date()
          }
          console.log("Setting fallback message:", fallbackMessage)
          setCustomMessages([fallbackMessage])
        }
      } finally {
        if (mounted) {
          setIsIntroLoading(false)
          setHasShownIntro(true)
        }
      }
    }

    generateIntro()

    return () => {
      mounted = false
    }
  }, [character, hasShownIntro, messagesLength])

  const resetIntro = () => {
    setCustomMessages([])
    setHasShownIntro(false)
  }

  // Filter out any image messages and combine with custom messages
  const filteredMessages = [
    ...customMessages.filter(msg => !msg.isImage), 
    ...chatMessages.filter(msg => !msg.imageUrl).map(msg => ({
      ...msg,
      isImage: false
    }))
  ] as Message[]

  return {
    filteredMessages,
    customMessages,
    isIntroLoading,
    resetIntro
  }
} 