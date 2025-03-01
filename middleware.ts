import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of paths that require authentication
const protectedPaths = ["/settings", "/profile"]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: "",
            ...options
          })
        }
      }
    }
  )

  // Refresh session if needed
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error) {
    console.error("Error refreshing auth session:", error)
  }

  // If session exists, try to refresh it
  if (session) {
    const { error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError) {
      console.error("Error refreshing token:", refreshError)
    }
  }

  // Check if the request is for a protected path
  const requestUrl = new URL(request.url)
  const isProtectedPath = protectedPaths.some((path) =>
    requestUrl.pathname.startsWith(path)
  )

  // If it's a protected path and there's no session, redirect to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("next", requestUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
}
