"use client"

import { cn } from "@/lib/utils"
import { CharacterGrid } from "./components/home/CharacterGrid"
import { Hero } from "./components/home/Hero"
import { useSidebar } from "./components/layout/Sidebar"
import { useIsMobile } from "@/lib/hooks/use-mobile"

export default function Home() {
  const { isExpanded } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col w-full">
      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 p-6 transition-all duration-300 relative",
          isMobile ? "pt-20" : isExpanded ? "md:ml-[240px]" : "md:ml-[72px]"
        )}
      >
        <Hero />
        <CharacterGrid />
      </main>
    </div>
  )
}
