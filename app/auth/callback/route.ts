import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  // Extract search parameters and origin from the request URL
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") || "/"

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // After successful auth, redirect to the next URL or home
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's no code or an error occurred, redirect to signin with error
  return NextResponse.redirect(
    `${origin}/?error=${encodeURIComponent(
      "Authentication failed. Please try again."
    )}`
  )
}
