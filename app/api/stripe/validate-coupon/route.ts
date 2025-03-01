import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"

export async function POST(req: Request) {
  try {
    const { couponCode } = await req.json()

    // First try to retrieve as a promotion code
    try {
      const promotionCodes = await stripe.promotionCodes.list({
        code: couponCode,
        active: true
      })

      if (promotionCodes.data.length > 0) {
        const promoCode = promotionCodes.data[0]
        if (promoCode.coupon) {
          return NextResponse.json({ coupon: promoCode.coupon })
        }
      }
    } catch (error) {
      console.error("Error checking promotion code:", error)
    }

    // If not found as promotion code, try as coupon code
    try {
      const coupon = await stripe.coupons.retrieve(couponCode)
      if (coupon.valid) {
        return NextResponse.json({ coupon })
      }
    } catch (error) {
      console.error("Error checking coupon:", error)
    }

    return NextResponse.json(
      { error: "Invalid or expired coupon code" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    )
  }
}
