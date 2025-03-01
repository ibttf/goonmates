import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    console.log("Starting subscription cancellation for user:", userId)
    const supabase = createClient()

    // Verify user is authenticated
    const {
      data: { session }
    } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      console.log("Authentication failed for user:", userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log("User authenticated successfully:", session.user.id)

    // Get subscription ID from database
    const { data: subscription } = await supabase
      .from("users")
      .select("stripe_subscription_id, current_period_end")
      .eq("user_id", userId)
      .single()

    console.log("Retrieved subscription data:", subscription)

    if (!subscription?.stripe_subscription_id) {
      console.log("No active subscription found for user:", userId)
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      )
    }

    // Cancel the subscription at period end
    console.log(
      "Canceling subscription with Stripe:",
      subscription.stripe_subscription_id
    )
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
        metadata: {
          user_id: userId
        }
      }
    )
    console.log("Stripe subscription updated:", {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
      cancel_at: updatedSubscription.cancel_at,
      current_period_end: updatedSubscription.current_period_end
    })

    // Update the subscription in our database with the actual timestamps from Stripe
    console.log("Updating subscription in database:", {
      cancel_at: updatedSubscription.cancel_at
        ? new Date(updatedSubscription.cancel_at * 1000).toISOString()
        : null,
      canceled_at: new Date().toISOString()
    })
    const { error: updateError } = await supabase
      .from("users")
      .update({
        cancel_at: updatedSubscription.cancel_at
          ? new Date(updatedSubscription.cancel_at * 1000).toISOString()
          : null,
        canceled_at: new Date().toISOString(),
        current_period_end: new Date(
          updatedSubscription.current_period_end * 1000
        ).toISOString()
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating subscription in database:", updateError)
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      )
    }

    console.log("Successfully cancelled subscription for user:", userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in cancel-subscription:", error)
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    )
  }
}
