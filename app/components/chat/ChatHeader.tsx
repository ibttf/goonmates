import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Character } from "@/lib/characters"

interface ChatHeaderProps {
  character: Character
  onNewChat: () => void
}

export function ChatHeader({ character, onNewChat }: ChatHeaderProps) {
  return (
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
        <h2 className="text-lg font-semibold text-white">{character.name}</h2>
        <p className="text-sm text-gray-400">{character.series}</p>
      </div>
      <div className="ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="text-xs"
        >
          New Chat
        </Button>
      </div>
    </div>
  )
}
