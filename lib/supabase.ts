import { createClient } from '@supabase/supabase-js'

const getCleanEnv = (value: string | undefined): string | null => {
  if (!value) return null
  const cleaned = value.trim()
  if (cleaned === '' || cleaned === 'undefined' || cleaned === 'null') return null
  return cleaned
}

const defaultUrl = 'https://zrjbmaesmbqqgxknidea.supabase.co'
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyamJtYWVzbWJxcWd4a25pZGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjI2NTMsImV4cCI6MjA5MDY5ODY1M30.RT5zmprjWA5Y5NG4VSVpODU9X4llY1_8tfY-9bXQuGg'

const urlEnv = getCleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
const keyEnv = getCleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const supabaseUrl = (urlEnv && urlEnv.startsWith('http')) ? urlEnv : defaultUrl
const supabaseAnonKey = keyEnv ? keyEnv : defaultKey

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
