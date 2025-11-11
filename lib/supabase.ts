import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface BillHistory {
  id: string
  bill_number: string
  table_number: string
  type: 'retail' | 'wholesale'
  payment_method: 'cash' | 'online' | 'credit'
  items: BillItem[]
  subtotal: number
  tax: number
  total: number
  created_at: string
  updated_at: string
}

export interface BillItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
}
