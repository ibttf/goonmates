import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"
import { SearchBar } from "./SearchBar"
import { Character, charactersBySeries } from "@/app/data/characters"

export function CharacterGrid() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCharactersBySeries = useMemo(() => {
    if (!searchQuery.trim()) return charactersBySeries

    const filtered: Record<string, Character[]> = {}

    Object.entries(charactersBySeries).forEach(([series, characters]) => {
      const matchingCharacters = characters.filter(
        (character) =>
          character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          character.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          character.personality
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          character.series.toLowerCase().includes(searchQuery.toLowerCase())
      )

      if (matchingCharacters.length > 0) {
        filtered[series] = matchingCharacters
      }
    })

    return filtered
  }, [searchQuery])

  return (
    <div className="space-y-16">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      {Object.entries(filteredCharactersBySeries).map(
        ([series, characters]) => (
          <div key={series} className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent flex items-center gap-2">
              {series}
              {series === "Trending 🔥" && (
                <span className="text-sm px-2 py-1 rounded-full bg-pink-500/20 text-pink-300">
                  Most Popular
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <Link
                  href={`/chat/${character.name.toLowerCase()}`}
                  key={character.name}
                  className="block group relative overflow-hidden rounded-2xl bg-gradient-to-b from-pink-500/10 to-purple-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                >
                  <div className="aspect-[3/4] relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                    <Image
                      src={character.imageUrl}
                      alt={character.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transition-transform duration-500 ease-out group-hover:-translate-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-pink-400 bg-pink-950/50 px-2 py-1 rounded-full">
                          {character.series}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {character.name} {character.age}
                      </h3>
                      <p className="text-sm text-gray-300 mt-2 line-clamp-2 group-hover:line-clamp-none transition-all duration-500 ease-out">
                        {character.personality}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
