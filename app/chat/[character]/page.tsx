"use client"

import { Suspense } from "react"
import { ChatHeader } from "@/app/components/chat/ChatHeader"
import { ChatInput } from "@/app/components/chat/ChatInput"
import { MessageList } from "@/app/components/chat/MessageList"
import { useIntroMessage } from "@/app/components/chat/useIntroMessage"
import { useSidebar } from "@/app/components/layout/Sidebar"
import { SubscriptionDialog } from "@/app/components/ui/subscription-dialog"
import { useAuthContext } from "@/app/providers"
import { Character, CHARACTERS } from "@/lib/characters"
import useChat from "@/lib/hooks/use-chat"
import useCheckout from "@/lib/hooks/use-checkout"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

function ChatPageContent() {
  const { isExpanded } = useSidebar()
  const params = useParams()

  const characterName = decodeURIComponent(
    (params.character as string).toLowerCase()
  )
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const { user, isSubscribed } = useAuthContext()
  const { isCheckoutLoading, checkoutError, handleCheckout } = useCheckout()
  const inputRef = useRef<HTMLInputElement>(null)
  const [character, setCharacter] = useState<Character | null>(null)

  const {
    messages: chatMessages,
    isLoading,
    clearMessages,
    input,
    isError,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    generateImage
  } = useChat()

  // Get character data
  useEffect(() => {
    console.log("Character search:", {
      characterName,
      encodedName: params.character,
      foundCharacter: CHARACTERS.find(
        (c) =>
          c.name.toLowerCase().replace(/\s+/g, " ") ===
          characterName.replace(/\s+/g, " ")
      )
    })
    const foundCharacter = CHARACTERS.find(
      (c) =>
        c.name.toLowerCase().replace(/\s+/g, " ") ===
        characterName.replace(/\s+/g, " ")
    )
    setCharacter(foundCharacter || null)
  }, [characterName])

  const { filteredMessages, isIntroLoading, resetIntro } = useIntroMessage(
    character,
    chatMessages.length,
    chatMessages
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    await originalHandleSubmit(
      e,
      () => {
        if (!isSubscribed) {
          setShowSubscriptionDialog(true)
          return false
        }
        return true
      },
      character?.name
    )
  }

  const handleNewChat = async () => {
    console.log("🔄 [NewChat] Starting new chat sequence")
    console.log("🗑️ [NewChat] Clearing messages and conversation...")
    await clearMessages()
    console.log("🔄 [NewChat] Resetting intro state...")
    await resetIntro()
    console.log("✅ [NewChat] New chat sequence completed")
  }

  const handleImageGeneration = () => {
    if (!input.trim()) return;

    // Check subscription status
    if (!isSubscribed) {
      setShowSubscriptionDialog(true);
      return;
    }

    generateImage(input);
  };

  // Show loading state while character is being loaded
  if (characterName && !character) {
    return (
      <div className="flex flex-col w-full h-screen">
        <div
          className={cn(
            "flex-1 flex flex-col h-full relative",
            isExpanded ? "md:ml-[240px]" : "md:ml-[72px]"
          )}
        >
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if character not found
  if (!character) {
    return (
      <div className="flex flex-col w-full h-screen">
        <div
          className={cn(
            "flex-1 flex flex-col h-full relative",
            isExpanded ? "md:ml-[240px]" : "md:ml-[72px]"
          )}
        >
          <div className="flex justify-center items-center h-full">
            <div className="text-white">Character not found</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <div
        className={cn(
          "flex-1 flex flex-col h-full relative",
          isExpanded ? "md:ml-[240px]" : "md:ml-[72px]"
        )}
      >
        <ChatHeader character={character} onNewChat={handleNewChat} />

        <MessageList
          messages={filteredMessages}
          isLoading={isLoading || isIntroLoading}
          character={character}
        />

        <ChatInput
          input={input}
          isLoading={isLoading}
          isError={isError}
          characterName={character.name}
          inputRef={inputRef}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onGenerateImage={handleImageGeneration}
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

export default function CharacterChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  )
}
