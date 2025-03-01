"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"

// Create auth context
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null)

// Create auth provider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Create hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      {...props}
    >
      <AuthProvider>{children}</AuthProvider>
    </NextThemesProvider>
  )
}
