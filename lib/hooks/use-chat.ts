"use client"

import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "./use-auth"

export interface Message {
  id?: string
  role: "user" | "assistant"
  content: string
  imageUrl?: string
  createdAt?: string
}

interface Conversation {
  id: string
  title: string
  createdAt: string
  lastMessageAt: string
}

interface ChatHook {
  messages: Message[]
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  input: string
  isError: boolean
  sendMessage: (text: string, characterName?: string) => Promise<void>
  clearMessages: () => void
  generateImage: (prompt: string) => Promise<void>
  startNewConversation: () => void
  loadConversation: (conversationId: string) => Promise<void>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    onSubscriptionCheck?: () => boolean,
    characterName?: string
  ) => Promise<void>
  setInput: (input: string) => void
  resetError: () => void
}

// functions for chat functionality
// - includes image generation
// - includes voice response
// - includes text-to-speech API
// - includes venice image API
// - includes user authentication and message saving

export default function useChat(): ChatHook {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [isError, setIsError] = useState(false)

  // Load user's conversations when they log in
  useEffect(() => {
    if (user) {
      loadUserConversations()
    } else {
      // Clear conversations when user logs out
      setConversations([])
      setCurrentConversationId(null)
    }
  }, [user])

  // Load the current conversation when conversationId changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId)
    }
  }, [currentConversationId])

  const loadUserConversations = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false })

      if (error) throw error

      if (data) {
        const formattedConversations: Conversation[] = data.map((conv) => ({
          id: conv.id,
          title: conv.title,
          createdAt: conv.created_at,
          lastMessageAt: conv.last_message_at
        }))

        setConversations(formattedConversations)

        // Load the most recent conversation if exists
        if (formattedConversations.length > 0 && !currentConversationId) {
          setCurrentConversationId(formattedConversations[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  const startNewConversation = useCallback(async () => {
    setMessages([])

    if (!user) {
      // For non-authenticated users, just clear messages
      setCurrentConversationId(null)
      return
    }

    try {
      const newId = crypto.randomUUID()
      const now = new Date().toISOString()

      // Create a new conversation in the database
      const { error } = await supabase.from("conversations").insert({
        id: newId,
        user_id: user.id,
        title: "New Conversation",
        created_at: now,
        last_message_at: now
      })
      console.log(error)
      if (error) throw error

      setCurrentConversationId(newId)

      // Refresh the conversations list
      loadUserConversations()
      console.log("New conversation created:", newId)
    } catch (error) {
      console.log(error)
      console.error("Error creating new conversation:", error)
    }
  }, [user])

  const loadConversation = async (conversationId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error

      if (data) {
        const loadedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          imageUrl: msg.image_url,
          createdAt: msg.created_at
        }))

        setMessages(loadedMessages)
        setCurrentConversationId(conversationId)
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
    }
  }

  const saveMessage = async (message: Message) => {
    if (!user || !currentConversationId) return message

    try {
      const now = new Date().toISOString()
      const messageId = crypto.randomUUID()

      // Save the message to the database
      const { error } = await supabase.from("messages").insert({
        id: messageId,
        conversation_id: currentConversationId,
        user_id: user.id,
        role: message.role,
        content: message.content,
        image_url: message.imageUrl,
        created_at: now
      })

      if (error) throw error

      // Update the conversation's last_message_at
      await supabase
        .from("conversations")
        .update({
          last_message_at: now,
          // Update title to first message if it's the first message
          ...(messages.length === 0 && message.role === "user"
            ? { title: message.content.substring(0, 50) }
            : {})
        })
        .eq("id", currentConversationId)

      // Return the saved message with its ID
      return {
        ...message,
        id: messageId,
        createdAt: now
      }
    } catch (error) {
      console.error("Error saving message:", error)
      return message
    }
  }

  const generateImage = useCallback(
    async (prompt: string) => {
      try {
        setIsLoading(true)

        const userMessage: Message = {
          role: "user",
          content: `Generate image: ${prompt}`
        }

        // Save user message if authenticated
        const savedUserMessage = user
          ? await saveMessage(userMessage)
          : userMessage
        setMessages((prev) => [...prev, savedUserMessage])

        const response = await fetch("/api/venice-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "SD 3.5",
            prompt: prompt
          })
        })

        if (!response.ok) {
          throw new Error("Failed to generate image")
        }

        const data = await response.json()

        if (!data.imageUrl) {
          throw new Error("No image URL returned from API")
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: "Here is the generated image:",
          imageUrl: data.imageUrl
        }

        // Save assistant message if authenticated
        const savedAssistantMessage = user
          ? await saveMessage(assistantMessage)
          : assistantMessage
        setMessages((prev) => [...prev, savedAssistantMessage])

        return data
      } catch (error) {
        console.error("Error generating image:", error)

        const errorMessage: Message = {
          role: "assistant",
          content:
            "Sorry, I encountered an error generating the image. Please try again."
        }

        // Save error message if authenticated
        const savedErrorMessage = user
          ? await saveMessage(errorMessage)
          : errorMessage
        setMessages((prev) => [...prev, savedErrorMessage])

        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [user, messages, currentConversationId]
  )

  const playVoiceResponse = async (text: string) => {
    try {
      // request to text-to-speech API
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error("Failed to generate voice response")
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      // Set audio properties to ensure better playback
      audio.preload = "auto"

      return new Promise<void>((resolve, reject) => {
        // Handle audio playback errors
        audio.addEventListener("error", (e) => {
          console.error("Audio playback error:", e)
          reject(new Error("Audio playback failed"))
        })

        // Handle audio ending
        audio.addEventListener("ended", () => {
          // Clean up the object URL to prevent memory leaks
          URL.revokeObjectURL(audioUrl)
          resolve()
        })

        // Start playing the audio
        const playPromise = audio.play()

        // Handle play() promise rejection (common in some browsers)
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Audio play promise error:", error)
            reject(error)
          })
        }
      })
    } catch (error) {
      console.error("Error playing voice response:", error)
      throw error // Re-throw to allow proper handling upstream
    }
  }

  const sendMessage = useCallback(
    async (text: string, characterName?: string) => {
      if (!text.trim()) return

      // Create a new conversation if this is the first message and user is authenticated
      if (messages.length === 0 && user && !currentConversationId) {
        await startNewConversation()
      }

      const userMessage: Message = { role: "user", content: text }

      // Save user message if authenticated
      const savedUserMessage = user
        ? await saveMessage(userMessage)
        : userMessage
      setMessages((prev) => [...prev, savedUserMessage])

      setIsLoading(true)

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            characterName: characterName
          })
        })

        if (!response.ok) {
          console.log(response)
          throw new Error("Failed to get response from API")
        }

        const data = await response.json()
        const botMessage: Message = { role: "assistant", content: data.message }

        // Save assistant message if authenticated
        const savedBotMessage = user
          ? await saveMessage(botMessage)
          : botMessage
        setMessages((prev) => [...prev, savedBotMessage])

        try {
          // Wait for the audio to finish playing completely
          await playVoiceResponse(data.message)
          console.log(data.message)
          console.log("Audio playback completed successfully")
        } catch (audioError) {
          console.error("Audio playback failed:", audioError)
          // Continue with the conversation even if audio fails
        }
      } catch (error) {
        console.error("Error sending message:", error)
        setIsError(true)
      } finally {
        setIsLoading(false)
        setInput("")
      }
    },
    [messages, user, currentConversationId, saveMessage, playVoiceResponse]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    if (user) {
      startNewConversation()
    }
  }, [user, startNewConversation])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = useCallback(
    async (
      e: React.FormEvent<HTMLFormElement>,
      onSubscriptionCheck?: () => boolean,
      characterName?: string
    ) => {
      e.preventDefault()
      if (onSubscriptionCheck && !onSubscriptionCheck()) {
        setIsError(true)
        return
      }
      await sendMessage(input, characterName)
    },
    [input, sendMessage]
  )

  const resetError = useCallback(() => {
    setIsError(false)
  }, [])

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    input,
    isError,
    sendMessage,
    clearMessages,
    generateImage,
    startNewConversation,
    loadConversation,
    handleInputChange,
    handleSubmit,
    setInput,
    resetError
  }
}
