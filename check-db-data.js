const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oqpvuvkddyrdyrrtwlfz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHZ1dmtkZHlyZHlycnR3bGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjI2NTMsImV4cCI6MjA5MDY5ODY1M30.ybmLhFwPvAfSftmV46x4_e2cPiB0UMsVw_gSgp_jprg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('--- Database Check ---')
  
  // 1. Categories
  const { data: categories, error: catError } = await supabase.from('categories').select('*')
  if (catError) {
    console.error('❌ Error reading categories:', catError)
  } else {
    console.log(`✅ Categories count: ${categories.length}`)
    console.log('Categories:', categories)
  }
  
  // 2. Products
  const { data: products, error: prodError } = await supabase.from('products').select('*')
  if (prodError) {
    console.error('❌ Error reading products:', prodError)
  } else {
    console.log(`✅ Products count: ${products.length}`)
    if (products.length > 0) {
      console.log('Sample product:', products[0])
    }
  }
  
  // 3. Bill History
  const { data: bills, error: billError } = await supabase.from('bill_history').select('*')
  if (billError) {
    console.error('❌ Error reading bill_history:', billError)
  } else {
    console.log(`✅ Bill History count: ${bills.length}`)
    if (bills.length > 0) {
      console.log('Sample bill:', bills[0])
    }
  }
}

checkData()
