import { useState, useEffect } from "react"
import { Character } from "@/lib/characters"
import { Message } from "./MessageItem"

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

  useEffect(() => {
    const generateIntro = async () => {
      console.log("Checking intro generation:", {
        hasCharacter: !!character,
        hasIntroMessage: !!introMessage,
        messagesLength,
        characterName: character?.name
      })

      // Only skip if we already have an intro or there are existing messages
      if (!character || introMessage || messagesLength > 0) {
        return
      }

      setIsIntroLoading(true)
      console.log("Starting intro generation for:", character.name)

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
        console.log("Intro generation response:", data)

        const newIntroMessage: Message = {
          role: "assistant",
          content: data.content,
          id: "intro",
          createdAt: new Date()
        }
        setIntroMessage(newIntroMessage)

        // Add profile picture message
        const profileMessage: Message = {
          role: "assistant",
          content: "",
          id: "profile-pic",
          createdAt: new Date(),
          imageUrl: character.imageUrl
        }
        setProfilePicMessage(profileMessage)
        console.log("Set intro and profile messages:", {
          newIntroMessage,
          profileMessage
        })
      } catch (error) {
        console.error("Error in intro generation:", error)
        // Fallback to using personality directly if API fails
        const fallbackMessage: Message = {
          role: "assistant",
          content: character.personality,
          id: "intro",
          createdAt: new Date()
        }
        setIntroMessage(fallbackMessage)

        // Still add profile picture message
        const profileMessage: Message = {
          role: "assistant",
          content: "",
          id: "profile-pic",
          createdAt: new Date(),
          imageUrl: character.imageUrl
        }
        setProfilePicMessage(profileMessage)
        console.log("Set fallback and profile messages:", {
          fallbackMessage,
          profileMessage
        })
      } finally {
        setIsIntroLoading(false)
        console.log("Finished intro generation, loading state set to false")
      }
    }

    generateIntro()
  }, [character, messagesLength, introMessage])

  const resetIntro = () => {
    setIntroMessage(null)
    setProfilePicMessage(null)
  }

  // Combine intro message with chat messages
  const filteredMessages = [
    ...(introMessage ? [introMessage] : []),
    ...(profilePicMessage ? [profilePicMessage] : []),
    ...chatMessages
  ] as Message[]

  // Log filtered messages
  console.log("Current messages state:", {
    hasIntroMessage: !!introMessage,
    hasProfilePicMessage: !!profilePicMessage,
    isLoading: isIntroLoading,
    totalMessages: filteredMessages.length,
    messages: filteredMessages
  })

  return {
    filteredMessages,
    isIntroLoading,
    resetIntro
  }
}
