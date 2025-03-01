"use client"

import { useParams } from "next/navigation"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Character, charactersBySeries } from "@/app/data/characters"
import { Send } from "lucide-react"
import { Sidebar } from "@/app/components/layout/Sidebar"
import { useSidebar } from "@/app/components/layout/Sidebar"
import { useChat } from "ai/react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const { isExpanded } = useSidebar()
  const params = useParams()
  const characterName = (params.character as string).toLowerCase()
  const [isError, setIsError] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      body: {
        character: characterName
      },
      onError: () => {
        setIsError(true)
        setTimeout(() => setIsError(false), 3000)
      }
    })

  // Find the character data
  const character = Object.values(charactersBySeries)
    .flat()
    .find((char) => char.name.toLowerCase() === characterName)

  if (!character) {
    return <div>Character not found</div>
  }

  return (
    <div className="flex">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col h-screen overflow-hidden bg-[#111111] ${
          isExpanded ? "ml-[240px]" : "ml-[72px]"
        } transition-[margin] duration-300`}
      >
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[#222222]">
          <Avatar className="h-10 w-10">
            <AvatarImage src={character.imageUrl} alt={character.name} />
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {character.name}
            </h2>
            <p className="text-sm text-gray-400">{character.series}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={character.imageUrl} alt={character.name} />
                </Avatar>
              </div>
              <p className="text-center max-w-sm">
                Start chatting with {character.name}! They're excited to get to
                know you.
              </p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={character.imageUrl} alt={character.name} />
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-pink-500 text-white"
                    : "bg-[#222222] text-white"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar-placeholder.png" alt="You" />
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
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

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#222222]">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={`Message ${character.name}...`}
              className={`flex-1 bg-[#222222] border-none text-white placeholder-gray-400 ${
                isError ? "ring-2 ring-red-500" : ""
              }`}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className={`${
                isLoading
                  ? "bg-pink-500/50 cursor-not-allowed"
                  : "bg-pink-500 hover:bg-pink-600"
              } text-white`}
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
