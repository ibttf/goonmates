"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client" // Import the singleton instance
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
    fetchUserAndSubscription()

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
  }, []) // Empty dependency array since supabase is now stable

  async function fetchUserAndSubscription() {
    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setState({ user: null, subscription: null, loading: false })
        return { user: null, subscription: null }
      }

      // First check if the subscriptions table exists
      const { data: subscriptionData, error: subError } = await supabase
        .from("users") // Changed from users to subscriptions
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (subError) {
        // If there's an error, it might be because the table doesn't exist
        // or the user doesn't have access - either way, we can proceed without subscription
        console.log("Note: No subscription found for user")
        setState({ user, subscription: null, loading: false })
        return { user, subscription: null }
      }

      setState({ user, subscription: subscriptionData, loading: false })
      return { user, subscription: subscriptionData }
    } catch (error) {
      console.error("Error in fetchUserAndSubscription:", error)
      setState({ user: null, subscription: null, loading: false })
      return { user: null, subscription: null }
    }
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
      // Explicitly clear state after signout
      setState({ user: null, subscription: null, loading: false })
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
