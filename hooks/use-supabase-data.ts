"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { CategoryService, Category as SupabaseCategory } from '@/lib/category-service'
import { ProductService, Product as SupabaseProduct } from '@/lib/product-service'

// Cache for storing data
const dataCache = {
  categories: null as any[] | null,
  products: null as any[] | null,
  lastFetch: 0,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
}

// Convert Supabase product to your app's product format
function convertSupabaseProduct(supabaseProduct: SupabaseProduct) {
  return {
    id: supabaseProduct.id,
    name: supabaseProduct.name,
    price: supabaseProduct.retail_price, // Default to retail price
    category: supabaseProduct.category_id,
    stock: supabaseProduct.stock,
    lowStockThreshold: supabaseProduct.low_stock_threshold,
    wholesalePrice: supabaseProduct.wholesale_price,
    retailPrice: supabaseProduct.retail_price,
    orderCount: supabaseProduct.order_count,
  }
}

// Convert Supabase category to your app's category format
function convertSupabaseCategory(supabaseCategory: SupabaseCategory) {
  return {
    id: supabaseCategory.id,
    name: supabaseCategory.name,
    color: supabaseCategory.color,
  }
}

export function useSupabaseData() {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)

  const loadData = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) return
    
    const now = Date.now()
    const isCacheValid = dataCache.lastFetch && (now - dataCache.lastFetch) < dataCache.cacheTimeout
    
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid && dataCache.categories && dataCache.products) {
      setCategories(dataCache.categories)
      setProducts(dataCache.products)
      setLoading(false)
      console.log('✅ Loaded from cache:', {
        categories: dataCache.categories.length,
        products: dataCache.products.length
      })
      return
    }

    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)

      // Load categories and products from Supabase
      const [supabaseCategories, supabaseProducts] = await Promise.all([
        CategoryService.getCategories(),
        ProductService.getProducts()
      ])

      // Convert to your app's format
      const convertedCategories = supabaseCategories.map(convertSupabaseCategory)
      const convertedProducts = supabaseProducts.map(convertSupabaseProduct)

      // Update cache
      dataCache.categories = convertedCategories
      dataCache.products = convertedProducts
      dataCache.lastFetch = now

      setCategories(convertedCategories)
      setProducts(convertedProducts)
      
      console.log('✅ Loaded from Supabase:', {
        categories: convertedCategories.length,
        products: convertedProducts.length
      })
    } catch (err) {
      console.error('❌ Error loading from Supabase:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [])

  const addCategory = async (category: { id: string; name: string; color: string }) => {
    try {
      const result = await CategoryService.createCategory(category)
      if (result) {
        setCategories(prev => [...prev, convertSupabaseCategory(result)])
        return result
      }
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const success = await CategoryService.deleteCategory(id)
      if (success) {
        setCategories(prev => prev.filter(c => c.id !== id))
        // Also remove products in this category
        setProducts(prev => prev.filter(p => p.category !== id))
      }
      return success
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  const addProduct = async (product: any) => {
    try {
      const supabaseProduct = {
        id: product.id,
        name: product.name,
        retail_price: product.retailPrice,
        wholesale_price: product.wholesalePrice,
        category_id: product.category,
        stock: product.stock,
        low_stock_threshold: product.lowStockThreshold,
        order_count: product.orderCount || 0,
      }

      const result = await ProductService.createProduct(supabaseProduct)
      if (result) {
        setProducts(prev => [...prev, convertSupabaseProduct(result)])
        return result
      }
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  const updateProduct = async (id: string, updates: any) => {
    try {
      const supabaseUpdates: any = {}
      
      if (updates.name) supabaseUpdates.name = updates.name
      if (updates.retailPrice) supabaseUpdates.retail_price = updates.retailPrice
      if (updates.wholesalePrice) supabaseUpdates.wholesale_price = updates.wholesalePrice
      if (updates.category) supabaseUpdates.category_id = updates.category
      if (updates.stock !== undefined) supabaseUpdates.stock = updates.stock
      if (updates.lowStockThreshold) supabaseUpdates.low_stock_threshold = updates.lowStockThreshold
      if (updates.orderCount !== undefined) supabaseUpdates.order_count = updates.orderCount

      const result = await ProductService.updateProduct(id, supabaseUpdates)
      if (result) {
        setProducts(prev => prev.map(p => p.id === id ? convertSupabaseProduct(result) : p))
        return result
      }
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const success = await ProductService.deleteProduct(id)
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== id))
      }
      return success
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  const incrementProductOrder = async (productId: string) => {
    try {
      await ProductService.incrementOrderCount(productId)
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, orderCount: p.orderCount + 1 } : p
      ))
    } catch (error) {
      console.error('Error incrementing order count:', error)
    }
  }

  const decrementStock = async (productId: string, quantity: number) => {
    try {
      await ProductService.decrementStock(productId, quantity)
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
      ))
    } catch (error) {
      console.error('Error decrementing stock:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    categories,
    products,
    loading,
    error,
    refetch: () => loadData(true), // Force refresh when manually refetching
    loadData,
    addCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    incrementProductOrder,
    decrementStock,
  }
}
