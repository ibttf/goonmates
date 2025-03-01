"use client"

import { useParams } from "next/navigation"
import { useState, useRef } from "react"
import { Character, charactersBySeries } from "@/app/data/characters"
import { useSidebar } from "@/app/components/layout/Sidebar"
import useChat from "@/lib/hooks/use-chat"
import useCheckout from "@/lib/hooks/use-checkout"
import { cn } from "@/lib/utils"
import { useAuthContext } from "@/app/providers"
import { SubscriptionDialog } from "@/app/components/ui/subscription-dialog"
import { ChatHeader } from "@/app/components/chat/ChatHeader"
import { MessageList } from "@/app/components/chat/MessageList"
import { ChatInput } from "@/app/components/chat/ChatInput"
import { useIntroMessage } from "@/app/components/chat/useIntroMessage"
import { Message } from "@/app/components/chat/MessageItem"

export default function ChatPage() {
  const { isExpanded } = useSidebar()
  const params = useParams()
  
  const characterName = (params.character as string).toLowerCase()
  const [isError, setIsError] = useState(false)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const { user, isSubscribed } = useAuthContext()
  const { isCheckoutLoading, checkoutError, handleCheckout } = useCheckout()
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    messages: chatMessages,
    isLoading,
    sendMessage,
    clearMessages,
    startNewConversation
  } = useChat()

  const character = Object.values(charactersBySeries)
    .flat()
    .find((char) => char.name.toLowerCase() === characterName)

  const { customMessages, isIntroLoading, resetIntro } = useIntroMessage(
    character, 
    chatMessages.length
  )

  // Filter out any image messages from the chat messages
  const messages = [
    ...customMessages.filter(msg => !msg.isImage), 
    ...chatMessages.filter(msg => !msg.imageUrl).map(msg => ({
      ...msg,
      isImage: false
    }))
  ] as Message[]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    
    if (!user) {
      return
    }
    
    if (!isSubscribed) {
      setShowSubscriptionDialog(true)
      return
    }
    
    const message = input
    setInput("")
    
    try {
      await sendMessage(message)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsError(true)
      setTimeout(() => setIsError(false), 3000)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleNewChat = () => {
    clearMessages()
    resetIntro()
  }

  if (!character) {
    return <div>Character not found</div>
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <div
        className={cn(
          "flex-1 flex flex-col h-full relative",
          isExpanded ? "md:ml-[240px]" : "md:ml-[72px]"
        )}
      >
        <ChatHeader 
          character={character} 
          onNewChat={handleNewChat} 
        />

        <MessageList 
          messages={messages} 
          character={character} 
          isLoading={isLoading || isIntroLoading} 
        />

        <ChatInput 
          input={input}
          isLoading={isLoading}
          isError={isError}
          characterName={character.name}
          inputRef={inputRef}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </div>

      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        onSubscribe={() => handleCheckout({ allowPromotionCodes: true })}
      />
    </div>
  )
}
