"use client"

import { useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "./use-auth"
import { DatabaseService } from "../services/database"
import type { Message, Conversation } from "../supabase/client"

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
      const conversations = await DatabaseService.getUserConversations(user.id)
      setConversations(conversations)

      // Load the most recent conversation if exists
      if (conversations.length > 0 && !currentConversationId) {
        setCurrentConversationId(conversations[0].id)
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  const startNewConversation = useCallback(async () => {
    setMessages([])

    if (!user) {
      setCurrentConversationId(null)
      return
    }

    try {
      const newConversation = await DatabaseService.createConversation(
        user.id,
        "New Conversation",
        "New Chat"
      )

      if (newConversation) {
        setCurrentConversationId(newConversation.id)
        await loadUserConversations()
      }
    } catch (error) {
      console.error("Error creating new conversation:", error)
    }
  }, [user])

  const loadConversation = async (conversationId: string) => {
    if (!user) return

    try {
      const messages = await DatabaseService.getConversationMessages(
        conversationId
      )
      setMessages(messages)
      setCurrentConversationId(conversationId)
    } catch (error) {
      console.error("Error loading conversation:", error)
    }
  }

  const sendMessage = useCallback(
    async (text: string, characterName?: string) => {
      if (!text.trim() || !user) return
      console.log("test4")
      // Create a new conversation if this is the first message
      if (messages.length === 0 && !currentConversationId) {
        const newConversation = await DatabaseService.createConversation(
          user.id,
          characterName || "Unknown Character",
          text.substring(0, 50) // Use first 50 chars of message as title
        )
        if (newConversation) {
          setCurrentConversationId(newConversation.id)
        } else {
          setIsError(true)
          return
        }
      }

      if (!currentConversationId) {
        setIsError(true)
        return
      }

      setIsLoading(true)

      try {
        // Save user message
        const savedUserMessage = await DatabaseService.saveMessage(
          currentConversationId,
          user.id,
          text,
          "user"
        )

        if (savedUserMessage) {
          setMessages((prev) => [...prev, savedUserMessage])
        }

        // Get AI response
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: text }],
            characterName: characterName
          })
        })

        if (!response.ok) {
          throw new Error("Failed to get response from API")
        }

        const data = await response.json()
        console.log("API Response:", data)

        if (data.error) {
          throw new Error(data.error)
        }

        // Save assistant message
        const savedAssistantMessage = await DatabaseService.saveMessage(
          currentConversationId,
          user.id,
          data.message,
          "assistant"
        )

        if (savedAssistantMessage) {
          setMessages((prev) => [...prev, savedAssistantMessage])
        }
      } catch (error) {
        console.error("Error sending message:", error)
        setIsError(true)
      } finally {
        setIsLoading(false)
        setInput("")
      }
    },
    [messages, user, currentConversationId]
  )

  const generateImage = useCallback(
    async (prompt: string) => {
      if (!user || !currentConversationId) return

      try {
        setIsLoading(true);

        // Save user message for image generation
        const userMessage = await DatabaseService.saveMessage(
          currentConversationId,
          user.id,
          `Generate image: ${prompt}`,
          "user"
        )

        if (userMessage) {
          setMessages((prev) => [...prev, userMessage])
        }

        // Create a FormData object for the API request
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('model_id', 'nGyN44N');

        const response = await fetch("/api/image", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Failed to generate image");
        }

        const data = await response.json();
        console.log(data)

        // Get the image URL from the response
        const imageUrl = data.images?.[0]

        if (!imageUrl) {
          throw new Error("No image URL in the response");
        }

        // Save assistant message with generated image
        const assistantMessage = await DatabaseService.saveMessage(
          currentConversationId,
          user.id,
          "Here is the generated image:",
          "assistant",
          imageUrl
        )

        if (assistantMessage) {
          setMessages((prev) => [...prev, assistantMessage])
        }
      } catch (error) {
        console.error("Error generating image:", error);
        setIsError(true);

        const errorMessage = await DatabaseService.saveMessage(
          currentConversationId,
          user.id,
          "Sorry, I encountered an error generating the image. Please try again.",
          "assistant"
        )

        if (errorMessage) {
          setMessages((prev) => [...prev, errorMessage])
        }

        throw error
      } finally {
        setIsLoading(false);
        setInput("");
      }
    },
    [user, currentConversationId]
  )

  const clearMessages = useCallback(() => {
    console.log("🗑️ [Chat] Clearing messages from state")
    setMessages([])
    setInput("")
  }, [])

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
      // if (onSubscriptionCheck && !onSubscriptionCheck()) {
      //   setIsError(true)
      //   return
      // }
      console.log("test2")
      console.log("input:", input)
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
