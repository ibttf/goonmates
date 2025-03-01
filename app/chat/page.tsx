"use client"

import { Suspense } from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/app/components/layout/Sidebar"
import { useIsMobile } from "@/lib/hooks/use-mobile"

function ChatPageContent() {
  const { isExpanded } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col w-full">
      <main
        className={cn(
          "flex-1 transition-all duration-300 relative",
          isMobile ? "pt-20" : isExpanded ? "md:ml-[240px]" : "md:ml-[72px]"
        )}
      >
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-white">
              Select a Character
            </h1>
            <p className="text-gray-400">
              Choose a character to start chatting!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  )
}
