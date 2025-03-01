"use client"

import { MessageSquare } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Character } from "@/app/data/characters"
import { MessageItem, Message } from "@/app/components/chat/MessageItem"
import { useSidebar } from "@/app/components/layout/Sidebar"

// Default character for displaying messages
const defaultCharacter: Character = {
  name: "Character",
  age: 25,
  description: "AI Character",
  personality: "Helpful and friendly AI assistant",
  imageUrl: "/avatar-placeholder.png",
  series: "default"
}

export default function ChatPage() {
  const { isExpanded } = useSidebar()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("id")
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch conversations when the component mounts
    fetchConversations()
    
    if (conversationId) {
      fetchMessages(conversationId)
    }
  }, [conversationId])

  const fetchConversations = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })
      
      console.log("Conversations:", data)
      
      if (error) throw error
      
      if (data) {
        setConversations(data)
      }
    } catch (err) {
      console.error('Error loading conversations:', err)
      setError('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })
        .limit(1) // Get first 10 messages

      console.log("Messages:", data)
      console.log("Error:", error)
      
      if (error) throw error
      
      if (data) {
        const loadedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          imageUrl: msg.image_url,
          createdAt: msg.created_at
        }))
        
        setMessages(loadedMessages)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Error Loading Messages</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
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

  return (
    <div className={`flex flex-col w-full h-full transition-all duration-300`}>
      {/* Scrollable container with fixed height calculation */}
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-4 md:p-6 pb-24">
          <h2 className="text-xl font-bold text-white mb-6 mt-2">Your Conversations</h2>
          
          {/* Conversations grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {conversations.map((conversation) => (
              <a 
                key={conversation.id}
                href={`/chat?id=${conversation.id}`}
                className={`p-4 rounded-lg bg-[#222222] hover:bg-[#333333] transition-colors ${
                  conversationId === conversation.id ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#333333] flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-white truncate">
                      {conversation.title || 'Untitled Conversation'}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {new Date(conversation.last_message_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          {/* Selected conversation messages */}
          {conversationId && (
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">
                {conversations.find(c => c.id === conversationId)?.title || 'Conversation'}
              </h3>
              
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <MessageItem 
                      key={msg.id || index} 
                      message={msg} 
                      character={defaultCharacter} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No messages in this conversation yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
