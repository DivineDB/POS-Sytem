"use client"

import { useState, FormEvent } from "react"
import { Plus } from "lucide-react"

export function InventoryHeader({ onAddCategory }: { onAddCategory: (name: string) => void }) {
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryName, setCategoryName] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (categoryName.trim()) {
      onAddCategory(categoryName)
      setCategoryName("")
      setShowCategoryForm(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Inventory Management</h1>
      {showCategoryForm ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="px-3 py-2 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-lg text-foreground"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-pos-brand text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowCategoryForm(false)}
            className="px-4 py-2 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-lg hover:opacity-90 transition"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowCategoryForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-lg hover:opacity-90 transition"
        >
          <Plus size={18} />
          Add Category
        </button>
      )}
    </div>
  )
}
