import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Send } from "lucide-react"
import { FormEvent, ChangeEvent, RefObject } from "react"

interface ChatInputProps {
  input: string
  isLoading: boolean
  isError: boolean
  characterName: string
  inputRef: RefObject<HTMLInputElement | null>
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function ChatInput({
  input,
  isLoading,
  isError,
  characterName,
  inputRef,
  onInputChange,
  onSubmit
}: ChatInputProps) {
  return (
    <div className="border-t border-[#222222] bg-[#111111] p-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={onInputChange}
            placeholder={`Message ${characterName}...`}
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
  )
} 