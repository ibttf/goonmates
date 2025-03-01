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
  isLoading: {
    auth: boolean
    subscription: boolean
    signIn: boolean
    signOut: boolean
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    subscription: null,
    isLoading: {
      auth: true, // Initial auth check
      subscription: false,
      signIn: false,
      signOut: false
    }
  })

  // Separate subscription check
  const checkSubscription = async (userId: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, subscription: true }
    }))

    try {
      const { data: subscriptionData, error: subError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (subError) {
        console.log("No subscription found for user")
        return null
      }

      return subscriptionData
    } catch (error) {
      console.error("Error checking subscription:", error)
      return null
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, subscription: false }
      }))
    }
  }

  useEffect(() => {
    let mounted = true

    // Function to update state if component is still mounted
    const safeSetState = (newState: Partial<AuthState>) => {
      if (mounted) {
        setState((prev) => ({ ...prev, ...newState }))
      }
    }

    // Initial auth check
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session) {
          safeSetState({
            user: null,
            subscription: null,
            isLoading: { ...state.isLoading, auth: false }
          })
          return
        }

        // Get subscription data if we have a user
        const subscription = await checkSubscription(session.user.id)

        safeSetState({
          user: session.user,
          subscription,
          isLoading: { ...state.isLoading, auth: false }
        })
      } catch (error) {
        console.error("Auth check error:", error)
        safeSetState({
          user: null,
          subscription: null,
          isLoading: { ...state.isLoading, auth: false }
        })
      }
    }

    // Run initial check
    checkAuth()

    // Set up auth state change listener
    const {
      data: { subscription: authSubscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === "SIGNED_OUT") {
        safeSetState({
          user: null,
          subscription: null,
          isLoading: {
            ...state.isLoading,
            auth: false,
            subscription: false
          }
        })
        return
      }

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        if (!session) return

        const subscription = await checkSubscription(session.user.id)

        safeSetState({
          user: session.user,
          subscription,
          isLoading: {
            ...state.isLoading,
            auth: false,
            subscription: false
          }
        })
      }
    })

    return () => {
      mounted = false
      authSubscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async (next?: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, signIn: true }
    }))

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
      console.error("Sign in error:", error)
      throw error
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, signIn: false }
      }))
    }
  }

  const signOut = async () => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, signOut: true }
    }))

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setState({
        user: null,
        subscription: null,
        isLoading: {
          auth: false,
          subscription: false,
          signIn: false,
          signOut: false
        }
      })
    } catch (error) {
      console.error("Sign out error:", error)
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, signOut: false }
      }))
      throw error
    }
  }

  return {
    user: state.user,
    subscription: state.subscription,
    isLoading: state.isLoading,
    isSubscribed: state.subscription?.status === "active",
    signInWithGoogle,
    signOut
  }
}
