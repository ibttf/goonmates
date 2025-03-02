"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { PostgrestError } from "@supabase/supabase-js"

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isSubscribed: boolean
  signIn: (next?: string) => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error)
        setIsLoading(false)
        return
      }
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Check subscription status whenever user changes
  useEffect(() => {
    if (!user) {
      setIsSubscribed(false)
      return
    }

    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("status")
          .eq("user_id", user.id)
          .single()

        if (error) {
          // If no row found, it means no subscription
          if (error.code === "PGRST116") {
            setIsSubscribed(false)
            return
          }

          console.error("Unexpected error checking subscription:", error)
          setIsSubscribed(false)
          return
        }

        setIsSubscribed(data?.status === "active")
      } catch (error) {
        console.error("Error checking subscription status:", error)
        setIsSubscribed(false)
      }
    }

    checkSubscription()
  }, [user])

  const signIn = async (next?: string) => {
    setIsLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: "select_account"
          }
        }
      })

      if (error) throw error
    } catch (error) {
      console.error("Error signing in with Google:", error)
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error("Error signing out:", error)
      throw new Error("Failed to sign out")
    }
  }

  return {
    user,
    isLoading,
    isSubscribed,
    signIn,
    signOut
  }
}
