import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"

export async function POST(req: Request) {
  try {
    const { customerId, paymentMethodId } = await req.json()

    // Update customer's default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Failed to set default payment method" },
      { status: 500 }
    )
  }
}
