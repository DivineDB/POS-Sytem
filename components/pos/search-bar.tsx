"use client"

import { Search } from "lucide-react"

export function SearchBar({ onSearch }: { onSearch?: (query: string) => void }) {
  return (
    <div className="pos-panel flex items-center gap-2 px-3 py-2 w-80 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--pos-brand)] focus-within:outline-none focus-within:ring-offset-background">
      <Search className="h-4 w-4 text-foreground/70" aria-hidden />
      <input
        aria-label="Search"
        placeholder="Search"
        className="bg-transparent outline-none text-sm w-full placeholder:text-foreground/50"
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  )
}
