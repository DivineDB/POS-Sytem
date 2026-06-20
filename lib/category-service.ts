import { Category } from './supabase'

export type { Category }

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories')
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error fetching categories:', json.error)
        return []
      }

      return json.data || []
    } catch (error) {
      console.error('Error in getCategories:', error)
      return []
    }
  }

  static async createCategory(category: Omit<Category, 'created_at' | 'updated_at'>): Promise<Category | null> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error creating category:', json.error)
        return null
      }

      return json.data
    } catch (error) {
      console.error('Error in createCategory:', error)
      return null
    }
  }

  static async updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category | null> {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error updating category:', json.error)
        return null
      }

      return json.data
    } catch (error) {
      console.error('Error in updateCategory:', error)
      return null
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        console.error('Error deleting category:', json.error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteCategory:', error)
      return false
    }
  }
}
