import { Product } from './supabase'

export type { Product }

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products')
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error fetching products:', json.error)
        return []
      }

      return json.data || []
    } catch (error) {
      console.error('Error in getProducts:', error)
      return []
    }
  }

  static async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const res = await fetch(`/api/products?categoryId=${categoryId}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error fetching products by category:', json.error)
        return []
      }

      return json.data || []
    } catch (error) {
      console.error('Error in getProductsByCategory:', error)
      return []
    }
  }

  static async createProduct(product: Omit<Product, 'created_at' | 'updated_at'>): Promise<Product | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error creating product:', json.error)
        return null
      }

      return json.data
    } catch (error) {
      console.error('Error in createProduct:', error)
      return null
    }
  }

  static async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error updating product:', json.error)
        return null
      }

      return json.data
    } catch (error) {
      console.error('Error in updateProduct:', error)
      return null
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error deleting product:', json.error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteProduct:', error)
      return false
    }
  }

  static async incrementOrderCount(id: string): Promise<boolean> {
    try {
      const res = await fetch('/api/products/increment-order-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error incrementing order count:', json.error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in incrementOrderCount:', error)
      return false
    }
  }

  static async decrementStock(id: string, quantity: number): Promise<boolean> {
    try {
      const res = await fetch('/api/products/decrement-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, quantity }),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error decrementing stock:', json.error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in decrementStock:', error)
      return false
    }
  }
}
