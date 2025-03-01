import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { SidebarProvider, Sidebar } from "@/app/components/layout/Sidebar"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Goonmates - Your AI Companion",
  description: "Create and chat with your perfect AI companion"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <SidebarProvider>
            <div className="flex min-h-screen bg-[#111111] relative">
              <Sidebar />
              <div className="flex-1 relative">{children}</div>
            </div>
            <Toaster />
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  )
}
