"use client"

import { useState, useEffect } from 'react'
import { CategoryService } from '@/lib/category-service'

export default function DebugDeletePage() {
  const [categories, setCategories] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const loadCategories = async () => {
    setLoading(true)
    try {
      const cats = await CategoryService.getCategories()
      setCategories(cats)
      setStatus(`✅ Loaded ${cats.length} categories`)
    } catch (error) {
      setStatus(`❌ Error loading: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Delete "${categoryName}"?`)) return

    setStatus(`🗑️ Deleting ${categoryName}...`)
    try {
      console.log("Attempting to delete category:", categoryId)
      const success = await CategoryService.deleteCategory(categoryId)
      
      if (success) {
        setStatus(`✅ Successfully deleted ${categoryName}`)
        // Reload categories
        await loadCategories()
      } else {
        setStatus(`❌ Failed to delete ${categoryName} - operation returned false`)
      }
    } catch (error) {
      console.error("Delete error:", error)
      setStatus(`❌ Error deleting ${categoryName}: ${error}`)
    }
  }

  const addTestCategory = async () => {
    const testId = 'test-delete-' + Date.now()
    setStatus(`➕ Adding test category...`)
    try {
      const result = await CategoryService.createCategory({
        id: testId,
        name: 'Test Delete Category',
        color: 'tile-blue'
      })
      
      if (result) {
        setStatus(`✅ Added test category: ${result.name}`)
        await loadCategories()
      }
    } catch (error) {
      setStatus(`❌ Error adding test category: ${error}`)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🐛 Debug Category Delete</h1>
      
      <div className="space-y-4 mb-8">
        <button 
          onClick={loadCategories}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Reload Categories'}
        </button>
        
        <button 
          onClick={addTestCategory}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
        >
          Add Test Category
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <strong>Status:</strong> <span className="ml-2">{status}</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold">Categories ({categories.length})</h2>
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border">
            <div>
              <div className="font-medium">{cat.name}</div>
              <div className="text-sm text-gray-500">ID: {cat.id}</div>
              <div className="text-xs text-gray-400">Color: {cat.color}</div>
            </div>
            <button
              onClick={() => deleteCategory(cat.id, cat.name)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No categories found. Try reloading or check your Supabase connection.
        </div>
      )}
    </div>
  )
}
