"use client"

import { Trash2, Edit2 } from "lucide-react"

export function ProductList({
  products,
  onEdit,
  onDelete,
}: {
  products: any[]
  onEdit: (product: any) => void
  onDelete: (id: string) => void
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-foreground/50">
        <p>No products in this category</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-4 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-lg"
        >
          <div>
            <h3 className="font-medium text-foreground">{product.name}</h3>
            <p className="text-sm text-foreground/60">Rs {product.price}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 hover:bg-[var(--pos-stroke)] rounded-lg transition"
              aria-label="Edit product"
            >
              <Edit2 size={18} className="text-foreground/70" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 hover:bg-red-500/20 rounded-lg transition"
              aria-label="Delete product"
            >
              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
