import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oqpvuvkddyrdyrrtwlfz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHZ1dmtkZHlyZHlycnR3bGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjI2NTMsImV4cCI6MjA5MDY5ODY1M30.ybmLhFwPvAfSftmV46x4_e2cPiB0UMsVw_gSgp_jprg'

const supabase = createClient(supabaseUrl, supabaseKey)

// GET /api/bills/[id]
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from('bill_history')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('[API /api/bills/[id]] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('[API /api/bills/[id]] Unexpected error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/bills/[id]
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from('bill_history')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[API /api/bills/[id]] Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API /api/bills/[id]] Unexpected error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}
