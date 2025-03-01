import { MessageSquare } from "lucide-react"

export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="bg-[#222222] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Chats Yet</h2>
        <p className="text-gray-400">
          Your chat history will appear here once you start conversations with
          characters.
        </p>
      </div>
    </div>
  )
}
