"use client"

import { useState } from 'react'
import { CategoryService } from '@/lib/category-service'
import { ProductService } from '@/lib/product-service'

export default function FreshTestPage() {
  const [status, setStatus] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  const testConnection = async () => {
    setStatus('🔄 Testing connection...')
    try {
      // Test loading categories
      const cats = await CategoryService.getCategories()
      setCategories(cats)
      setStatus(`✅ SUCCESS! Loaded ${cats.length} categories from fresh Supabase tables`)
    } catch (error) {
      setStatus(`❌ FAILED: ${error}`)
    }
  }

  const testAddCategory = async () => {
    setStatus('🔄 Testing add category...')
    try {
      const newCategory = {
        id: 'test-' + Date.now(),
        name: 'Test Category ' + Date.now(),
        color: 'tile-blue'
      }
      
      const result = await CategoryService.createCategory(newCategory)
      if (result) {
        setStatus(`✅ SUCCESS! Added category: ${result.name}`)
        // Reload categories
        const cats = await CategoryService.getCategories()
        setCategories(cats)
      }
    } catch (error) {
      setStatus(`❌ ADD FAILED: ${error}`)
    }
  }

  const testDeleteCategory = async () => {
    if (categories.length === 0) {
      setStatus('❌ No categories to delete. Load categories first.')
      return
    }

    // Find a test category to delete
    const testCategory = categories.find(c => c.id.startsWith('test-'))
    if (!testCategory) {
      setStatus('❌ No test categories found to delete.')
      return
    }

    setStatus(`🔄 Testing delete category: ${testCategory.name}...`)
    try {
      const success = await CategoryService.deleteCategory(testCategory.id)
      if (success) {
        setStatus(`✅ SUCCESS! Deleted category: ${testCategory.name}`)
        // Reload categories
        const cats = await CategoryService.getCategories()
        setCategories(cats)
      }
    } catch (error) {
      setStatus(`❌ DELETE FAILED: ${error}`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🆕 Fresh Supabase Test</h1>
      
      <div className="space-y-4 mb-8">
        <button 
          onClick={testConnection}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium"
        >
          1️⃣ Test Load Categories
        </button>
        
        <button 
          onClick={testAddCategory}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium ml-4"
        >
          2️⃣ Test Add Category
        </button>
        
        <button 
          onClick={testDeleteCategory}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-medium ml-4"
        >
          3️⃣ Test Delete Category
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <strong>Status:</strong> <span className="ml-2">{status}</span>
      </div>

      {categories.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">📋 Categories ({categories.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className={`p-3 rounded-lg border ${
                cat.id.startsWith('test-') ? 'bg-yellow-100 border-yellow-300' : 'bg-white border-gray-200'
              }`}>
                <div className="font-medium">{cat.name}</div>
                <div className="text-sm text-gray-500">{cat.id}</div>
                <div className="text-xs text-gray-400">{cat.color}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">📝 Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300 text-sm">
          <li>First run the fresh schema SQL in Supabase</li>
          <li>Click "Test Load Categories" - should show 8 default categories</li>
          <li>Click "Test Add Category" - should add a new test category</li>
          <li>Click "Test Delete Category" - should delete the test category</li>
          <li>If all work, your Supabase is ready! 🎉</li>
        </ol>
      </div>
    </div>
  )
}
