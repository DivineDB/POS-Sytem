// Test Supabase Connection
// Run this with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// Your Supabase credentials
const supabaseUrl = 'https://oqpvuvkddyrdyrrtwlfz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHZ1dmtkZHlyZHlycnR3bGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjI2NTMsImV4cCI6MjA5MDY5ODY1M30.ybmLhFwPvAfSftmV46x4_e2cPiB0UMsVw_gSgp_jprg'

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: fetch
  }
})

async function testConnection() {
  console.log('🔄 Testing Supabase connection...')
  
  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing basic connection...')
    const { data, error } = await supabase.from('categories').select('count(*)')
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      console.log('Full error:', error)
      return
    }
    
    console.log('✅ Basic connection works!')
    
    // Test 2: List tables
    console.log('\n2️⃣ Checking what tables exist...')
    const tables = ['categories', 'products', 'bill_history']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ Table '${table}' error:`, error.message)
        } else {
          console.log(`✅ Table '${table}' exists and accessible`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}' failed:`, err.message)
      }
    }
    
    // Test 3: Try to read categories
    console.log('\n3️⃣ Testing categories read...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
    
    if (catError) {
      console.log('❌ Categories read failed:', catError.message)
    } else {
      console.log(`✅ Categories read success! Found ${categories?.length || 0} categories`)
      if (categories && categories.length > 0) {
        console.log('First category:', categories[0])
      }
    }
    
    // Test 4: Try to add a test category
    console.log('\n4️⃣ Testing category creation...')
    const testCategory = {
      id: 'test-connection-' + Date.now(),
      name: 'Test Connection Category',
      color: 'tile-blue'
    }
    
    const { data: newCat, error: createError } = await supabase
      .from('categories')
      .insert([testCategory])
      .select()
      .single()
    
    if (createError) {
      console.log('❌ Category creation failed:', createError.message)
      console.log('Full error:', createError)
    } else {
      console.log('✅ Category creation success!', newCat)
      
      // Clean up - delete the test category
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', testCategory.id)
      
      if (deleteError) {
        console.log('⚠️ Failed to clean up test category:', deleteError.message)
      } else {
        console.log('✅ Test category cleaned up')
      }
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error)
  }
}

// Run the test
testConnection().then(() => {
  console.log('\n🏁 Connection test complete!')
}).catch(err => {
  console.log('💥 Test crashed:', err)
})
