import { supabase } from './supabase'

export interface Category {
  id: string
  name: string
  color: string
  created_at?: string
  updated_at?: string
}

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getCategories:', error)
      return []
    }
  }

  static async createCategory(category: Omit<Category, 'created_at' | 'updated_at'>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createCategory:', error)
      return null
    }
  }

  static async updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating category:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateCategory:', error)
      return null
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting category:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteCategory:', error)
      return false
    }
  }
}
