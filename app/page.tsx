"use client"

import { cn } from "@/lib/utils"
import { CharacterGrid } from "./components/home/CharacterGrid"
import { Hero } from "./components/home/Hero"
import { Sidebar, useSidebar } from "./components/layout/Sidebar"

export default function Home() {
  const { isExpanded } = useSidebar()

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <div className="fixed inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />

      {/* Navbar */}
      {/* <Navbar /> */}

      <div className="relative flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 p-6 transition-all duration-300",
            isExpanded ? "md:ml-[240px]" : "md:ml-[72px]"
          )}
        >
          <Hero />
          <CharacterGrid />
        </main>
      </div>
    </div>
  )
}
