"use client"

import { cn } from "@/lib/utils"

export function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: any[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
}) {
  return (
    <div className="w-48 flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground/70 px-2">Categories</h3>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={cn(
            "px-3 py-2 rounded-lg text-left text-sm transition",
            selectedCategory === cat.id
              ? "bg-pos-brand text-black font-semibold shadow-sm"
              : "bg-[var(--pos-panel)] text-foreground/70 hover:text-foreground",
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
