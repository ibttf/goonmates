"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

interface Subscription {
  user_id: string
  status: string
  plan: string
  current_period_start: string
  current_period_end: string
  stripe_customer_id: string
  stripe_subscription_id: string
  cancel_at: string | null
  canceled_at: string | null
}

interface AuthState {
  user: User | null
  subscription: Subscription | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    subscription: null,
    loading: true
  })

  useEffect(() => {
    // Initial fetch
    fetchUserAndSubscription().then(({ user, subscription }) => {
      setState({ user, subscription, loading: false })
    })

    // Listen for auth changes
    const {
      data: { subscription: authSubscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { user, subscription } = await fetchUserAndSubscription()
        setState({ user, subscription, loading: false })
      } else {
        setState({ user: null, subscription: null, loading: false })
      }
    })

    return () => {
      authSubscription.unsubscribe()
    }
  }, [])

  async function fetchUserAndSubscription() {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()
    if (error || !user) return { user: null, subscription: null }

    const { data: subscription } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single()

    return { user, subscription }
  }

  async function signInWithGoogle(next?: string) {
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
      throw error
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return {
    user: state.user,
    subscription: state.subscription,
    loading: state.loading,
    isSubscribed: state.subscription?.status === "active",
    signInWithGoogle,
    signOut
  }
}
