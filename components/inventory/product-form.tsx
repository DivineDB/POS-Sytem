"use client"

import { useState, useEffect, FormEvent } from "react"

export function ProductForm({
  product,
  category,
  onSubmit,
  onCancel,
}: {
  product?: any
  category: string
  onSubmit: (product: any) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(product?.name || "")
  const [price, setPrice] = useState(product?.price || "")

  useEffect(() => {
    if (product) {
      setName(product.name)
      setPrice(product.price)
    }
  }, [product])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim() && price) {
      onSubmit({
        name: name.trim(),
        price: Number.parseFloat(price),
        category,
      })
      setName("")
      setPrice("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-lg">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
            className="w-full px-3 py-2 bg-[var(--pos-panel-2)] border border-[var(--pos-stroke)] rounded-lg text-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Price (Rs)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="w-full px-3 py-2 bg-[var(--pos-panel-2)] border border-[var(--pos-stroke)] rounded-lg text-foreground"
            required
            step="0.01"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-lg hover:opacity-90 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-pos-brand text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            {product ? "Update" : "Add"} Product
          </button>
        </div>
      </div>
    </form>
  )
}
