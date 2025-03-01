"use client"

import { Hero } from "./components/home/Hero"
import { Navbar } from "./components/layout/Navbar"
import { Sidebar } from "./components/layout/Sidebar"
import { CharacterGrid } from "./components/home/CharacterGrid"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <div className="fixed inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />

      {/* Navbar */}
      <Navbar />

      <div className="relative flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-6 mt-16 md:ml-56">
          <Hero />
          <CharacterGrid />
        </main>
      </div>
    </div>
  )
}
