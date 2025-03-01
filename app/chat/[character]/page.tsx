"use client"

import { useParams } from "next/navigation"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Character, charactersBySeries } from "@/app/data/characters"
import { Send } from "lucide-react"
import { useSidebar } from "@/app/components/layout/Sidebar"
import { useChat } from "ai/react"
import { cn } from "@/lib/utils"
import { useAuthContext } from "@/app/providers"
import { SubscriptionDialog } from "@/app/components/ui/subscription-dialog"
import Image from "next/image"

interface Message {
  role: "user" | "assistant"
  content: string
  id?: string
  createdAt?: Date
  isImage?: boolean
}

interface UIMessage extends Message {
  isImage?: boolean
}

export default function ChatPage() {
  const { isExpanded } = useSidebar()
  const params = useParams()
  const characterName = (params.character as string).toLowerCase()
  const [isError, setIsError] = useState(false)
  const [hasShownIntro, setHasShownIntro] = useState(false)
  const [customMessages, setCustomMessages] = useState<Message[]>([])
  const [isIntroLoading, setIsIntroLoading] = useState(false)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const { user, isSubscribed } = useAuthContext()

  const {
    messages: apiMessages,
    input,
    handleInputChange,
    handleSubmit: handleApiSubmit,
    isLoading
  } = useChat({
    api: "/api/chat",
    body: {
      character: characterName
    },
    onError: () => {
      setIsError(true)
      setTimeout(() => setIsError(false), 3000)
    }
  })

  const messages = [...customMessages, ...apiMessages]

  // Find the character data
  const character = Object.values(charactersBySeries)
    .flat()
    .find((char) => char.name.toLowerCase() === characterName)

  // Show intro message if no messages and hasn't shown intro yet
  useEffect(() => {
    let mounted = true

    const generateIntro = async () => {
      if (!mounted || !character || messages.length > 0 || hasShownIntro) {
        return
      }

      setIsIntroLoading(true)
      // Add initial loading message
      const loadingMessage: Message = {
        role: "assistant",
        content: "...",
        id: "intro-loading",
        createdAt: new Date()
      }
      setCustomMessages([loadingMessage])

      try {
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

        if (mounted) {
          const introMessage: Message = {
            role: "assistant",
            content: data.content,
            id: "intro",
            createdAt: new Date()
          }

          const imageMessage: Message = {
            role: "assistant",
            content: character.imageUrl,
            id: "intro-image",
            createdAt: new Date(),
            isImage: true
          }

          setCustomMessages([introMessage, imageMessage])
        }
      } catch (error) {
        console.error("Error generating intro:", error)
        // Fallback to default intro if API fails
        if (mounted) {
          const fallbackMessage: Message = {
            role: "assistant",
            content: `Hey! I'm ${character.name} from ${character.series}. Let's chat! 😊`,
            id: "intro",
            createdAt: new Date()
          }
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
  }, [character, hasShownIntro, messages.length])

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          allow_promotion_codes: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create checkout session")
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again."
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) {
      // Handle not logged in case
      return
    }
    if (!isSubscribed) {
      setShowSubscriptionDialog(true)
      return
    }
    handleApiSubmit(e)
  }

  if (!character) {
    return <div>Character not found</div>
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="fixed inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />

      <div
        className={cn(
          "flex-1 flex flex-col h-full relative",
          isExpanded ? "md:ml-[240px]" : "md:ml-[72px]"
        )}
      >
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[#222222] mt-[64px] md:mt-0 bg-[#111111] sticky top-0 z-10">
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-[#222222] flex items-center justify-center">
            <Image
              src={character.imageUrl}
              alt={character.name}
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {character.name}
            </h2>
            <p className="text-sm text-gray-400">{character.series}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={cn(
                  "flex gap-3 items-start",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-[#222222] flex items-center justify-center mt-1">
                    <Image
                      src={character.imageUrl}
                      alt={character.name}
                      width={32}
                      height={32}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[80%] md:max-w-[70%]",
                    msg.role === "user"
                      ? "bg-pink-500 text-white"
                      : "bg-[#222222] text-white"
                  )}
                >
                  {"isImage" in msg && msg.isImage ? (
                    <Image
                      src={msg.content}
                      alt={character.name}
                      width={192}
                      height={192}
                      className="rounded-md w-48 h-48 object-cover"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/avatar-placeholder.png" alt="You" />
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={character.imageUrl} alt={character.name} />
                </Avatar>
                <div className="max-w-[70%] rounded-lg p-3 bg-[#222222] text-white">
                  <div className="flex gap-1">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce delay-100">•</span>
                    <span className="animate-bounce delay-200">•</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-[#222222] bg-[#111111] p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={`Message ${character.name}...`}
                className={cn(
                  "flex-1 bg-[#222222] border-none text-white placeholder-gray-400",
                  isError && "ring-2 ring-red-500"
                )}
                disabled={isLoading}
              />
              <Button
                type="submit"
                className={cn(
                  "text-white",
                  isLoading
                    ? "bg-pink-500/50 cursor-not-allowed"
                    : "bg-pink-500 hover:bg-pink-600"
                )}
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        onSubscribe={handleCheckout}
      />
    </div>
  )
}
