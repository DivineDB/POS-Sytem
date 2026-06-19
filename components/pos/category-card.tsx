"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { Check } from "lucide-react"

export function CategoryCard({
  title,
  items,
  color,
  icon,
  onClick,
  isSelected,
}: {
  title: string
  items: number
  color: "tile-pink" | "tile-blue" | "tile-purple" | "tile-mint"
  icon?: React.ReactNode
  onClick?: () => void
  isSelected?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "tile p-4 cursor-pointer transition-all hover:opacity-80 text-left w-full relative",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand)] focus-visible:outline-none focus-visible:ring-offset-background",
        color,
        isSelected && "ring-2 ring-pos-brand ring-offset-2 ring-offset-background",
      )}
      onClick={onClick}
    >
      {isSelected && (
        <span className="absolute top-2 right-2 p-0.5 rounded-full bg-foreground/20 text-foreground">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      {icon && (
        <div className="flex items-start justify-between">
          <div className="opacity-70" aria-hidden>
            {icon}
          </div>
        </div>
      )}
      <div className={cn(icon ? "mt-8" : "mt-0")}>
        <div className="font-semibold text-lg text-pretty pr-6">{title}</div>
        <div className="text-xs opacity-70">{items} items</div>
      </div>
    </button>
  )
}
