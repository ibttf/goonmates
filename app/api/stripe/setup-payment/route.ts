import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id
    const email = session.user.email

    console.log("Setting up payment for user:", { userId, email })

    // Get or create customer
    let customerId: string
    const customers = await stripe.customers.list({
      email: email
    })

    if (customers.data.length > 0) {
      customerId = customers.data[0].id
      console.log("Found existing customer:", customerId)
    } else {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          user_id: userId
        }
      })
      customerId = customer.id
      console.log("Created new customer:", customerId)
    }

    // Create a Checkout Session for setting up a payment method
    console.log("Creating checkout session for customer:", customerId)
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "setup",
      payment_method_types: ["card"],
      customer: customerId,
      success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/settings?setup_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/settings?setup_canceled=true`,
      metadata: {
        user_id: userId
      },
      client_reference_id: userId
    })

    console.log("Created checkout session:", {
      id: checkoutSession.id,
      url: checkoutSession.url
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error in setup-payment:", error)
    return NextResponse.json(
      { error: "Failed to create setup session" },
      { status: 500 }
    )
  }
}
