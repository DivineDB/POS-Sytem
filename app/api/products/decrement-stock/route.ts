import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrjbmaesmbqqgxknidea.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyamJtYWVzbWJxcWd4a25pZGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NDc5NjEsImV4cCI6MjA5NzUyMzk2MX0.RT5zmprjWA5Y5NG4VSVpODU9X4llY1_8tfY-9bXQuGg'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()
    const { error } = await supabase
      .rpc('decrement_stock', { product_id: productId, quantity_to_subtract: quantity })

    if (error) {
      console.error('[API /api/products/decrement-stock] RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API /api/products/decrement-stock] Unexpected error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}
