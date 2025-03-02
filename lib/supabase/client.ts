import { createBrowserClient } from "@supabase/ssr"

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types for our database
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  image_url?: string
  isImage?: boolean
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  character_name: string
  created_at: string
  last_message_at: string
}
