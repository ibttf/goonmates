import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import Stripe from "stripe"

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json()

    // Get customer's payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card"
    })

    if (paymentMethods.data.length === 0) {
      return NextResponse.json({ paymentMethods: [] })
    }

    // Get customer to check default payment method
    const customer = (await stripe.customers.retrieve(
      customerId
    )) as Stripe.Customer
    const defaultPaymentMethodId =
      customer.invoice_settings?.default_payment_method

    // Map payment methods to our format
    const formattedPaymentMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand || "unknown",
      last4: pm.card?.last4 || "****",
      exp_month: pm.card?.exp_month || 0,
      exp_year: pm.card?.exp_year || 0,
      // If no default is set, make the first payment method the default
      isDefault: defaultPaymentMethodId
        ? pm.id === defaultPaymentMethodId
        : pm.id === paymentMethods.data[0].id
    }))

    // If no default payment method is set, set the first one as default
    if (!defaultPaymentMethodId && paymentMethods.data.length > 0) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethods.data[0].id
        }
      })
    }

    return NextResponse.json({
      paymentMethods: formattedPaymentMethods
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    )
  }
}
