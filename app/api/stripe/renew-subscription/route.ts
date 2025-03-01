import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    const supabase = createClient()

    // Verify user is authenticated
    const {
      data: { session }
    } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get subscription ID from database
    const { data: subscription } = await supabase
      .from("users")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .single()

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      )
    }

    // Remove the cancellation schedule
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false
      }
    )

    // Update the subscription in our database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        cancel_at: null,
        canceled_at: null
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating subscription in database:", updateError)
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Failed to renew subscription" },
      { status: 500 }
    )
  }
}
