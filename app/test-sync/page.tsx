"use client"

import { useState } from 'react'
import { runFullSync } from '@/lib/sync-to-supabase'
import { CategoryService } from '@/lib/category-service'
import { ProductService } from '@/lib/product-service'

export default function TestSyncPage() {
  const [status, setStatus] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  const handleSync = async () => {
    setStatus('Syncing data...')
    try {
      await runFullSync()
      setStatus('✅ Sync completed!')
    } catch (error) {
      setStatus('❌ Sync failed: ' + error)
    }
  }

  const testAddCategory = async () => {
    setStatus('Testing add category...')
    try {
      const result = await CategoryService.createCategory({
        id: 'test-category-' + Date.now(),
        name: 'Test Category',
        color: 'tile-blue'
      })
      setStatus('✅ Category added: ' + result?.name)
    } catch (error) {
      setStatus('❌ Add category failed: ' + error)
    }
  }

  const loadCategories = async () => {
    setStatus('Loading categories...')
    const cats = await CategoryService.getCategories()
    setCategories(cats)
    setStatus(`✅ Loaded ${cats.length} categories`)
  }

  const loadProducts = async () => {
    setStatus('Loading products...')
    const prods = await ProductService.getProducts()
    setProducts(prods)
    setStatus(`✅ Loaded ${prods.length} products`)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Sync Test</h1>
      
      <div className="space-y-4 mb-8">
        <button 
          onClick={handleSync}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          1. Sync Local Data to Supabase
        </button>
        
        <button 
          onClick={testAddCategory}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ml-4"
        >
          2. Test Add Category
        </button>
        
        <button 
          onClick={loadCategories}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
        >
          3. Test Load Categories
        </button>
        
        <button 
          onClick={loadProducts}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ml-4"
        >
          4. Test Load Products
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <strong>Status:</strong> {status}
      </div>

      {categories.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Categories ({categories.length})</h2>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white p-2 rounded border">
                {cat.name} ({cat.color})
              </div>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Products ({products.length})</h2>
          <div className="space-y-2">
            {products.map(prod => (
              <div key={prod.id} className="bg-white p-3 rounded border">
                <strong>{prod.name}</strong> - ₹{prod.retail_price} (Stock: {prod.stock})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
