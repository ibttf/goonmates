"use client"

import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { fetchCharacterByName, Character } from "@/lib/characters"
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
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const { user, isSubscribed } = useAuthContext()
  const { isCheckoutLoading, checkoutError, handleCheckout } = useCheckout()
  const inputRef = useRef<HTMLInputElement>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [isCharacterLoading, setIsCharacterLoading] = useState(true)
  
  const {
    messages: chatMessages,
    isLoading,
    clearMessages,
    input,
    isError,
    handleInputChange,
    handleSubmit: originalHandleSubmit
  } = useChat()

  // Fetch character data
  useEffect(() => {
    async function loadCharacter() {
      try {
        setIsCharacterLoading(true)
        const characterData = await fetchCharacterByName(characterName)
        setCharacter(characterData)
      } catch (error) {
        console.error("Error loading character:", error)
      } finally {
        setIsCharacterLoading(false)
      }
    }
    
    loadCharacter()
  }, [characterName])

  const { filteredMessages, isIntroLoading, resetIntro } = useIntroMessage(
    character, 
    chatMessages.length,
    chatMessages
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    await originalHandleSubmit(e, () => {
      if (!isSubscribed) {
        setShowSubscriptionDialog(true)
        return false
      }
      return true
    }, character?.id?.toString())
  }

  const handleNewChat = () => {
    clearMessages()
    resetIntro()
  }

  if (isCharacterLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-pink-400">Loading character...</div>
      </div>
    )
  }

  if (!character) {
    return <div className="flex justify-center items-center h-screen">Character not found</div>
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
          messages={filteredMessages} 
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
