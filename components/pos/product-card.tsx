"use client"

import { useCart } from "./cart-context"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProductCard({
  id,
  name,
  price,
  highlight,
}: {
  id: string
  name: string
  price: number
  highlight?: "tile-pink" | "tile-blue" | "tile-purple"
}) {
  const { items, inc, dec, add } = useCart()
  const item = items.find((i) => i.id === id)
  const qty = item?.qty ?? 0

  return (
    <div className={cn("tile p-4 bg-[var(--pos-panel)] text-foreground", highlight)}>
      <div className="font-medium">{name}</div>
      <div className="text-sm text-foreground/70">₹{price.toFixed(2)}</div>

      <div className="mt-6 flex items-center justify-center gap-1">
        <button
          className="pos-panel rounded-md w-8 h-8 flex items-center justify-center disabled:opacity-50 transition-opacity"
          aria-label={`Decrease ${name}`}
          onClick={() => {
            if (qty > 0) dec(id)
          }}
          disabled={qty === 0}
        >
          <Minus className="h-3 w-3" />
        </button>
        <div className="pos-panel rounded-md w-8 h-8 flex items-center justify-center text-sm font-medium">{qty}</div>
        <button
          className="pos-panel rounded-md w-8 h-8 flex items-center justify-center transition-opacity"
          aria-label={`Increase ${name}`}
          onClick={() => {
            if (qty > 0) {
              inc(id)
            } else {
              add({ id, name, price })
            }
          }}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
