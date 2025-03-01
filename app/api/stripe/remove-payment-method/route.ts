import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"

export async function POST(req: Request) {
  try {
    const { paymentMethodId } = await req.json()

    // Detach the payment method from the customer
    await stripe.paymentMethods.detach(paymentMethodId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Failed to remove payment method" },
      { status: 500 }
    )
  }
}
