import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json()
    const supabase = createClient()

    console.log("Received request with customer ID:", customerId)

    // Verify user is authenticated
    const {
      data: { session }
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get or create a test mode customer
    let testCustomerId: string
    try {
      // Try to find an existing test customer for this user
      const customers = await stripe.customers.list({
        email: session.user.email,
        limit: 1
      })

      if (customers.data.length > 0) {
        testCustomerId = customers.data[0].id
        console.log("Found existing test customer:", testCustomerId)
      } else {
        // Create a new test customer
        const customer = await stripe.customers.create({
          email: session.user.email,
          metadata: {
            user_id: session.user.id
          }
        })
        testCustomerId = customer.id
        console.log("Created new test customer:", testCustomerId)
      }
    } catch (error) {
      console.error("Error getting/creating test customer:", error)
      return NextResponse.json(
        { error: "Failed to get/create test customer" },
        { status: 500 }
      )
    }

    // Create a Stripe Checkout session for the one-time payment
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: testCustomerId,
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price: process.env.STRIPE_CREDIT_PRICE_ID,
            quantity: 1
          }
        ],
        metadata: {
          user_id: session.user.id,
          type: "credits_purchase",
          credits_amount: "50"
        },
        success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/?purchase_canceled=true`
      })

      console.log("Created checkout session:", checkoutSession.id)
      return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
      console.error("Error creating checkout session:", error)
      return NextResponse.json(
        {
          error:
            "Failed to create checkout session: " + (error as Error).message
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in purchase-credits:", error)
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    )
  }
}
