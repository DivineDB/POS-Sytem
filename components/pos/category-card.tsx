"use client"

import { cn } from "@/lib/utils"
import type React from "react"

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
    <div
      className={cn(
        "tile p-4 cursor-pointer transition-all hover:opacity-80",
        color,
        isSelected && "ring-2 ring-pos-brand ring-offset-2 ring-offset-background",
      )}
      onClick={onClick}
    >
      {icon && (
        <div className="flex items-start justify-between">
          <div className="opacity-70" aria-hidden>
            {icon}
          </div>
        </div>
      )}
      <div className={cn(icon ? "mt-8" : "mt-0")}>
        <div className="font-semibold text-lg text-pretty">{title}</div>
        <div className="text-xs opacity-70">{items} items</div>
      </div>
    </div>
  )
}
