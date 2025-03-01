import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json()

    // Create a SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session" // This allows the payment method to be used for future payments
    })

    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Failed to create setup intent" },
      { status: 500 }
    )
  }
}
