const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oqpvuvkddyrdyrrtwlfz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHZ1dmtkZHlyZHlycnR3bGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjI2NTMsImV4cCI6MjA5MDY5ODY1M30.ybmLhFwPvAfSftmV46x4_e2cPiB0UMsVw_gSgp_jprg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDelete() {
  console.log('🔄 Attempting to delete a category that has products...')
  // Let's find a category that has products
  const { data: products } = await supabase.from('products').select('*')
  console.log('Products:', products.map(p => ({ name: p.name, category_id: p.category_id })))
  
  // Try to delete a category that is referenced by products, e.g., 'brushes'
  const { error: deleteErr } = await supabase
    .from('categories')
    .delete()
    .eq('id', 'brushes')
    
  if (deleteErr) {
    console.error('❌ Deletion failed with error:', deleteErr)
  } else {
    console.log('✅ Deletion succeeded!')
  }
}

testDelete()
