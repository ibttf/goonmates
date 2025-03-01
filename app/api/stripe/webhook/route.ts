import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use the Stripe API version you need
  apiVersion: "2025-02-24.acacia"
})

// Create a Supabase client with admin privileges
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// We assume you have two secrets set in your .env file:
// STRIPE_WEBHOOK_SECRET for interviewcoder.co
// STRIPE_WEBHOOK_SECRET_SECONDARY for interviewcoder.net
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")
  const url = new URL(req.url)
  const hostname = url.hostname
  const host = req.headers.get("host")

  // Debug logging
  console.log("Webhook request details:", {
    url: req.url,
    hostname,
    host,
    headers: Object.fromEntries(req.headers.entries())
  })

  // Pick the correct secret based on the hostname or host header
  let webhookSecret: string

  // For local development
  if (hostname === "localhost" || host?.includes("localhost")) {
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET! // Use the CLI webhook secret
    console.log("Using local development webhook secret")
  }
  // Production domains
  else if (
    hostname.includes("interviewcoder.net") ||
    host?.includes("interviewcoder.net")
  ) {
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_SECONDARY!
    console.log("Using .NET webhook secret")
  } else {
    // Default to .co for production
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    console.log("Using .CO webhook secret")
  }

  // Verify we have a webhook secret
  if (!webhookSecret) {
    console.error("No webhook secret available for domain:", { hostname, host })
    return NextResponse.json(
      { error: "Webhook secret not configured for this domain" },
      { status: 500 }
    )
  }

  if (!signature) {
    console.error("No signature found in webhook request")
    return NextResponse.json({ error: "No signature found" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Construct the event using the chosen secret
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log(`Received webhook event (${hostname || host}):`, event.type)
  } catch (err) {
    console.error("Error verifying webhook signature:", {
      error: err,
      hostname,
      host,
      hasSecret: !!webhookSecret,
      secretPrefix: webhookSecret?.substring(0, 8)
    })
    return NextResponse.json(
      {
        error: `Webhook Error: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      },
      { status: 400 }
    )
  }

  try {
    // ─────────────────────────────────────────────
    //  Handle your event types below (UNCHANGED)
    // ─────────────────────────────────────────────

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription
      console.log("Processing subscription update:", {
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAt: subscription.cancel_at
      })

      let userId = subscription.metadata.user_id

      if (!userId) {
        console.log("No user_id in metadata, searching in database...")
        const { data: sub } = await supabase
          .from("users")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (sub) {
          userId = sub.user_id
          console.log("Found user_id in database:", userId)
        }
      }

      if (!userId) {
        console.error("No user_id found in metadata or database")
        return NextResponse.json({ error: "No user_id found" }, { status: 400 })
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          cancel_at: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000).toISOString()
            : null,
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating subscription:", updateError)
        return NextResponse.json(
          { error: "Error updating subscription" },
          { status: 500 }
        )
      }

      console.log("Successfully updated subscription for user:", userId)
      return NextResponse.json({ received: true })
    }

    // Handle setup intent events
    if (
      event.type === "setup_intent.created" ||
      event.type === "setup_intent.succeeded"
    ) {
      const setupIntent = event.data.object as Stripe.SetupIntent
      console.log("Processing setup intent:", {
        id: setupIntent.id,
        status: setupIntent.status,
        metadata: setupIntent.metadata
      })
      return NextResponse.json({ received: true })
    }

    // Handle payment method events
    if (event.type === "payment_method.attached") {
      const paymentMethod = event.data.object as Stripe.PaymentMethod
      console.log("Processing payment method:", {
        id: paymentMethod.id,
        type: paymentMethod.type,
        customer: paymentMethod.customer
      })
      return NextResponse.json({ received: true })
    }

    // Handle checkout.session.completed and payment_intent.succeeded
    if (
      event.type === "checkout.session.completed" ||
      event.type === "payment_intent.succeeded"
    ) {
      console.log("Processing payment event:", event.type)

      let userId: string | undefined
      let customerId: string | undefined
      let subscriptionId: string | undefined
      let isSetupMode = false
      let isCreditsPayment = false
      let creditsAmount: number | undefined

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        userId = session.client_reference_id || session.metadata?.user_id
        customerId = session.customer as string
        subscriptionId = session.subscription as string
        isSetupMode = session.mode === "setup"
        isCreditsPayment = session.metadata?.type === "credits_purchase"
        creditsAmount = session.metadata?.credits_amount
          ? parseInt(session.metadata.credits_amount)
          : undefined

        console.log("Checkout session details:", {
          userId,
          customerId,
          subscriptionId,
          mode: session.mode,
          metadata: session.metadata,
          isCreditsPayment,
          creditsAmount
        })

        // If this is just a setup session, return early
        if (isSetupMode) {
          console.log("Setup session completed; no subscription update needed.")
          return NextResponse.json({ received: true })
        }

        // Handle credits purchase
        if (isCreditsPayment && userId && creditsAmount) {
          console.log("Processing credits purchase:", { userId, creditsAmount })

          const { error: creditsError } = await supabase.rpc(
            "increment_credits",
            {
              p_user_id: userId,
              p_credits_amount: creditsAmount
            }
          )

          if (creditsError) {
            console.error("Error updating credits:", creditsError)
            return NextResponse.json(
              { error: "Error updating credits" },
              { status: 500 }
            )
          }

          console.log("Successfully updated credits for user:", userId)
          return NextResponse.json({ received: true })
        }

        // Handle new subscription
        if (subscriptionId && userId) {
          console.log("Processing new subscription:", {
            userId,
            subscriptionId
          })

          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          )

          const { error: subscriptionError } = await supabase
            .from("users")
            .upsert({
              user_id: userId,
              status: subscription.status,
              plan: "pro",
              credits: 50, // Initial credits for new subscription
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              cancel_at: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000).toISOString()
                : null,
              canceled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null
            })

          if (subscriptionError) {
            console.error("Error upserting subscription:", subscriptionError)
            return NextResponse.json(
              { error: "Error upserting subscription" },
              { status: 500 }
            )
          }

          console.log(
            "Successfully created/updated subscription for user:",
            userId
          )
          return NextResponse.json({ received: true })
        }
      } else {
        // Handle payment_intent.succeeded
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        userId = paymentIntent.metadata?.user_id
        customerId = paymentIntent.customer as string
        isCreditsPayment = paymentIntent.metadata?.type === "credits_purchase"
        creditsAmount = paymentIntent.metadata?.credits_amount
          ? parseInt(paymentIntent.metadata.credits_amount)
          : undefined

        // Handle credits purchase
        if (isCreditsPayment && userId && creditsAmount) {
          console.log("Processing credits purchase from payment intent:", {
            userId,
            creditsAmount
          })

          const { error: creditsError } = await supabase.rpc(
            "increment_credits",
            {
              p_user_id: userId,
              p_credits_amount: creditsAmount
            }
          )

          if (creditsError) {
            console.error("Error updating credits:", creditsError)
            return NextResponse.json(
              { error: "Error updating credits" },
              { status: 500 }
            )
          }

          console.log("Successfully updated credits for user:", userId)
          return NextResponse.json({ received: true })
        }

        // If this is a subscription-related payment
        if (paymentIntent.metadata?.subscriptionId) {
          subscriptionId = paymentIntent.metadata.subscriptionId
          console.log("Payment intent details:", {
            userId,
            customerId,
            subscriptionId,
            metadata: paymentIntent.metadata
          })
        } else {
          // Otherwise, probably a one-time payment or setup
          console.log("Payment succeeded without subscription:", {
            userId,
            customerId,
            metadata: paymentIntent.metadata
          })
          return NextResponse.json({ received: true })
        }
      }

      if (!userId || !customerId) {
        console.error("Missing required fields:", {
          userId,
          customerId,
          subscriptionId
        })
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      // Only proceed if we have a subscription ID
      if (!subscriptionId) {
        console.log("No subscription ID found, skipping subscription update")
        return NextResponse.json({ received: true })
      }

      // Retrieve subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      console.log("Retrieved subscription details:", {
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end
      })

      // Upsert subscription in DB
      const { error: subscriptionError } = await supabase.from("users").upsert({
        user_id: userId,
        status: subscription.status,
        plan: "pro",
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        cancel_at: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000).toISOString()
          : null,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null
      })

      if (subscriptionError) {
        console.error("Error upserting subscription:", subscriptionError)
        return NextResponse.json(
          { error: "Error upserting subscription" },
          { status: 500 }
        )
      }

      console.log("Successfully processed subscription for user:", userId)
      return NextResponse.json({ received: true })
    } else {
      console.log("Unhandled event type:", event.type)
    }

    // For any unhandled events, just respond OK
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Error processing webhook:", err)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
