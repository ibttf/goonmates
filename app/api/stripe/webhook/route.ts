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
  console.log("🔔 Webhook endpoint hit!")

  const body = await req.text()
  console.log("📝 Raw webhook body:", body.substring(0, 100) + "...")

  const signature = req.headers.get("stripe-signature")
  console.log("🔑 Stripe signature present:", !!signature)

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  console.log(
    "🔒 Webhook secret configured:",
    !!webhookSecret,
    "prefix:",
    webhookSecret?.substring(0, 8)
  )

  // Debug logging
  console.log("🌐 Webhook request details:", {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries())
  })

  // Verify we have a webhook secret
  if (!webhookSecret) {
    console.error("❌ No webhook secret configured")
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  if (!signature) {
    console.error("❌ No signature found in webhook request")
    return NextResponse.json({ error: "No signature found" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log("✅ Successfully constructed webhook event:", event.type)
  } catch (err) {
    console.error("Error verifying webhook signature:", {
      error: err,
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

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        userId = session.client_reference_id || session.metadata?.user_id
        customerId = session.customer as string
        subscriptionId = session.subscription as string
        isSetupMode = session.mode === "setup"

        console.log("Webhook: Processing checkout.session.completed", {
          session_id: session.id,
          userId,
          customerId,
          subscriptionId,
          mode: session.mode,
          metadata: session.metadata,
          client_reference_id: session.client_reference_id
        })

        // If this is just a setup session, return early
        if (isSetupMode) {
          console.log("Setup session completed; no subscription update needed.")
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

          console.log("Retrieved subscription details:", {
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            customer: subscription.customer,
            metadata: subscription.metadata
          })

          const { error: subscriptionError } = await supabase
            .from("users")
            .upsert({
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
            console.error("Error upserting subscription:", {
              error: subscriptionError,
              userId,
              subscriptionId,
              customerId
            })
            return NextResponse.json(
              { error: "Error upserting subscription" },
              { status: 500 }
            )
          }

          console.log(
            "Successfully created/updated subscription in database for user:",
            userId
          )
          return NextResponse.json({ received: true })
        }
      } else {
        // Handle payment_intent.succeeded
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        userId = paymentIntent.metadata?.user_id
        customerId = paymentIntent.customer as string

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
        console.error("Error upserting subscription:", {
          error: subscriptionError,
          userId,
          subscriptionId,
          customerId
        })
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
