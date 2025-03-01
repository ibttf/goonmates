import { Search } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative mb-8">
      <div className="relative w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pink-300/50" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search your dream waifu..."
          className="w-full rounded-lg bg-pink-500/10 border border-pink-500/20 py-1.5 pl-9 pr-3 text-sm text-pink-100 placeholder:text-pink-300/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
      </div>
    </div>
  )
}
