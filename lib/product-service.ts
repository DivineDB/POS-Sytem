import { supabase } from './supabase'

export interface Product {
  id: string
  name: string
  retail_price: number
  wholesale_price: number
  category_id: string
  stock: number
  low_stock_threshold: number
  order_count: number
  created_at?: string
  updated_at?: string
}

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching products:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProducts:', error)
      return []
    }
  }

  static async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching products by category:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProductsByCategory:', error)
      return []
    }
  }

  static async createProduct(product: Omit<Product, 'created_at' | 'updated_at'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createProduct:', error)
      return null
    }
  }

  static async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateProduct:', error)
      return null
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting product:', error)
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
      const { error } = await supabase
        .rpc('increment_order_count', { product_id: id })

      if (error) {
        console.error('Error incrementing order count:', error)
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
      const { error } = await supabase
        .rpc('decrement_stock', { product_id: id, quantity_to_subtract: quantity })

      if (error) {
        console.error('Error decrementing stock:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in decrementStock:', error)
      return false
    }
  }
}
