import "server-only"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(
          name: string,
          value: string,
          options: Omit<ResponseCookie, "name" | "value">
        ) {
          const cookieStore = await cookies()
          cookieStore.set(name, value, options)
        },
        async remove(
          name: string,
          options: Omit<ResponseCookie, "name" | "value">
        ) {
          const cookieStore = await cookies()
          cookieStore.set(name, "", {
            ...options,
            maxAge: 0,
            expires: new Date(0)
          })
        }
      }
    }
  )
}

// Service role client for webhook operations
export const createAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
