import { supabase } from "../supabase/client"
import type { Message, Conversation } from "../supabase/client"
import { PostgrestError } from "@supabase/supabase-js"

export class DatabaseService {
  static async getConversation(
    conversationId: string
  ): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single()

    if (error) {
      console.error("Error fetching conversation:", error)
      return null
    }

    return data
  }

  static async getConversationByCharacter(
    userId: string,
    characterName: string
  ): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("character_name", characterName)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the "no rows returned" error
      console.error("Error fetching conversation by character:", error)
      return null
    }

    return data
  }

  static async getConversationMessages(
    conversationId: string
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return []
    }

    return data || []
  }

  static async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false })

    if (error) {
      console.error("Error fetching user conversations:", error)
      return []
    }

    return data || []
  }

  static async createConversation(
    userId: string,
    characterName: string,
    title: string
  ): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        character_name: characterName,
        title,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      const pgError = error as PostgrestError
      console.error("Error creating conversation:", {
        code: pgError.code,
        message: pgError.message,
        details: pgError.details,
        hint: pgError.hint
      })
      return null
    }

    return data
  }

  static async saveMessage(
    conversationId: string,
    userId: string,
    content: string,
    role: "user" | "assistant",
    imageUrl?: string
  ): Promise<Message | null> {
    try {
      // First, save the message
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          content,
          role,
          image_url: imageUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (messageError) {
        const pgError = messageError as PostgrestError
        console.error("Error saving message:", {
          code: pgError.code,
          message: pgError.message,
          details: pgError.details,
          hint: pgError.hint,
          data: {
            conversationId,
            userId,
            role,
            hasContent: !!content,
            hasImageUrl: !!imageUrl
          }
        })
        return null
      }

      // Then, update the conversation's last_message_at
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)

      if (updateError) {
        const pgError = updateError as PostgrestError
        console.error("Error updating conversation timestamp:", {
          code: pgError.code,
          message: pgError.message,
          details: pgError.details,
          hint: pgError.hint
        })
      }

      return messageData
    } catch (error) {
      console.error("Unexpected error saving message:", error)
      return null
    }
  }

  static async deleteConversation(conversationId: string): Promise<boolean> {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)

    if (error) {
      console.error("Error deleting conversation:", error)
      return false
    }

    return true
  }
}
