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
    let mounted = true

    // Initial auth check
    async function checkInitialAuth() {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (session) {
          const { user, subscription } = await fetchUserAndSubscription()
          if (mounted) {
            setState({ user, subscription, loading: false })
          }
        } else {
          if (mounted) {
            setState({ user: null, subscription: null, loading: false })
          }
        }
      } catch (error) {
        console.error("Error checking initial auth:", error)
        if (mounted) {
          setState({ user: null, subscription: null, loading: false })
        }
      }
    }

    // Run initial auth check
    checkInitialAuth()

    // Listen for auth changes
    const {
      data: { subscription: authSubscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Don't set loading to true for initial session check
      if (event !== "INITIAL_SESSION") {
        setState((prev) => ({ ...prev, loading: true }))
      }

      try {
        if (session) {
          const { user, subscription } = await fetchUserAndSubscription()
          if (mounted) {
            setState({ user, subscription, loading: false })
          }
        } else {
          if (mounted) {
            setState({ user: null, subscription: null, loading: false })
          }
        }
      } catch (error) {
        console.error("Error handling auth state change:", error)
        if (mounted) {
          setState({ user: null, subscription: null, loading: false })
        }
      }
    })

    return () => {
      mounted = false
      authSubscription.unsubscribe()
    }
  }, [])

  async function fetchUserAndSubscription() {
    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!user) {
        return { user: null, subscription: null }
      }

      // First check if the subscriptions table exists
      const { data: subscriptionData, error: subError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (subError) {
        console.log("Note: No subscription found for user")
        return { user, subscription: null }
      }

      return { user, subscription: subscriptionData }
    } catch (error) {
      console.error("Error in fetchUserAndSubscription:", error)
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
