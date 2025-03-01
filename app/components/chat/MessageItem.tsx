import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Image from "next/image"

export interface Message {
  role: "user" | "assistant"
  content: string
  id?: string
  createdAt?: Date | string
  isImage?: boolean
  imageUrl?: string
}

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={cn(
        "flex gap-3 items-start",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {message.role === "assistant" && (
        <div className="h-8 w-8 rounded-lg overflow-hidden bg-[#222222] flex items-center justify-center mt-1">
          <Image
            src={message.imageUrl || "/avatar-placeholder.png"}
            alt={message.content}
            width={32}
            height={32}
            className="h-full w-full object-contain"
          />
        </div>
      )}
      <div
        className={cn(
          "rounded-lg p-3 max-w-[80%] md:max-w-[70%]",
          message.role === "user"
            ? "bg-pink-500 text-white"
            : "bg-[#222222] text-white"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {message.role === "user" && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src="/avatar-placeholder.png" alt="You" />
        </Avatar>
      )}
    </div>
  )
} 