import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of paths that require authentication
const protectedPaths = ["/settings", "/profile"]

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Check if the request is for a protected path
  const requestUrl = new URL(request.url)
  const isProtectedPath = protectedPaths.some((path) =>
    requestUrl.pathname.startsWith(path)
  )

  // If it's a protected path and there's no session, redirect to login
  if (isProtectedPath && !supabase.auth.session) {
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("next", requestUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)"
  ]
}
