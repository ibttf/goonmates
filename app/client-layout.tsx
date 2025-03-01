"use client"

import { SidebarProvider, Sidebar } from "@/app/components/layout/Sidebar"
import { Toaster } from "@/components/ui/sonner"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#111111] relative">
        <Sidebar />
        {/* The ml-[72px] ensures content doesn't get covered by collapsed sidebar */}
        <div className="flex-1 relative md:ml-[72px] transition-all duration-300">
          {children}
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
} 