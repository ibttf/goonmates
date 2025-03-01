import { MessageItem, Message } from "./MessageItem"
import Image from "next/image"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  characterImage?: string
}

export function MessageList({
  messages,
  isLoading,
  characterImage
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full p-4 space-y-4">
        {messages.map((msg, index) => (
          <MessageItem
            key={msg.id || index}
            message={msg}
            characterImage={characterImage}
          />
        ))}

        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-[#222222] flex items-center justify-center mt-1">
              <Image
                src={characterImage || "/avatar-placeholder.png"}
                alt={"Loading..."}
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </div>
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
  )
}
