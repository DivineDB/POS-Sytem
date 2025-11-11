import { CategoryService } from './category-service'
import { ProductService } from './product-service'

// This script helps sync your existing local data to Supabase
// Run this once to migrate your current Zustand data

export async function syncCategoriesToSupabase() {
  // Your existing categories from Zustand store
  const localCategories = [
    { id: "cleaning-agents", name: "Cleaning Agents", color: "tile-pink" },
    { id: "brooms-mops", name: "Brooms & Mops", color: "tile-purple" },
    { id: "brushes", name: "Brushes", color: "tile-blue" },
    { id: "dustpans", name: "Dustpans & Bins", color: "tile-purple" },
    { id: "gloves", name: "Gloves & Protection", color: "tile-pink" },
    { id: "sponges", name: "Sponges & Cloths", color: "tile-mint" },
    { id: "disinfectants", name: "Disinfectants", color: "tile-blue" },
    { id: "accessories", name: "Accessories", color: "tile-purple" },
  ]

  console.log('Syncing categories to Supabase...')
  
  for (const category of localCategories) {
    try {
      await CategoryService.createCategory(category)
      console.log(`✓ Synced category: ${category.name}`)
    } catch (error) {
      console.log(`Category ${category.name} already exists or error occurred`)
    }
  }
}

export async function syncProductsToSupabase() {
  // Your existing products from Zustand store
  const localProducts = [
    {
      id: "floor-cleaner",
      name: "Floor Cleaner 5L",
      retail_price: 450,
      wholesale_price: 380,
      category_id: "cleaning-agents",
      stock: 45,
      low_stock_threshold: 10,
      order_count: 120,
    },
    {
      id: "glass-cleaner",
      name: "Glass Cleaner Spray",
      retail_price: 180,
      wholesale_price: 150,
      category_id: "cleaning-agents",
      stock: 8,
      low_stock_threshold: 15,
      order_count: 95,
    },
    {
      id: "cotton-mop",
      name: "Cotton Mop Head",
      retail_price: 320,
      wholesale_price: 270,
      category_id: "brooms-mops",
      stock: 25,
      low_stock_threshold: 8,
      order_count: 78,
    },
    {
      id: "push-broom",
      name: "Heavy Duty Push Broom",
      retail_price: 550,
      wholesale_price: 480,
      category_id: "brooms-mops",
      stock: 5,
      low_stock_threshold: 10,
      order_count: 65,
    },
    {
      id: "toilet-brush",
      name: "Toilet Brush Set",
      retail_price: 220,
      wholesale_price: 180,
      category_id: "brushes",
      stock: 30,
      low_stock_threshold: 12,
      order_count: 110,
    },
    {
      id: "scrub-brush",
      name: "Scrubbing Brush",
      retail_price: 150,
      wholesale_price: 120,
      category_id: "brushes",
      stock: 18,
      low_stock_threshold: 10,
      order_count: 88,
    },
    {
      id: "dustpan-set",
      name: "Dustpan & Brush Set",
      retail_price: 280,
      wholesale_price: 230,
      category_id: "dustpans",
      stock: 22,
      low_stock_threshold: 8,
      order_count: 72,
    },
    {
      id: "waste-bin",
      name: "Plastic Waste Bin 50L",
      retail_price: 850,
      wholesale_price: 720,
      category_id: "dustpans",
      stock: 12,
      low_stock_threshold: 5,
      order_count: 45,
    },
    {
      id: "rubber-gloves",
      name: "Rubber Gloves (Pair)",
      retail_price: 120,
      wholesale_price: 95,
      category_id: "gloves",
      stock: 6,
      low_stock_threshold: 20,
      order_count: 150,
    },
    {
      id: "microfiber-cloth",
      name: "Microfiber Cloth Pack",
      retail_price: 200,
      wholesale_price: 165,
      category_id: "sponges",
      stock: 35,
      low_stock_threshold: 15,
      order_count: 92,
    },
    {
      id: "sponge-pack",
      name: "Kitchen Sponge 10-Pack",
      retail_price: 180,
      wholesale_price: 145,
      category_id: "sponges",
      stock: 28,
      low_stock_threshold: 12,
      order_count: 105,
    },
    {
      id: "disinfectant-spray",
      name: "Disinfectant Spray 500ml",
      retail_price: 250,
      wholesale_price: 210,
      category_id: "disinfectants",
      stock: 7,
      low_stock_threshold: 15,
      order_count: 130,
    },
  ]

  console.log('Syncing products to Supabase...')
  
  for (const product of localProducts) {
    try {
      await ProductService.createProduct(product)
      console.log(`✓ Synced product: ${product.name}`)
    } catch (error) {
      console.log(`Product ${product.name} already exists or error occurred`)
    }
  }
}

export async function runFullSync() {
  console.log('🚀 Starting full sync to Supabase...')
  
  try {
    await syncCategoriesToSupabase()
    await syncProductsToSupabase()
    console.log('✅ Full sync completed successfully!')
  } catch (error) {
    console.error('❌ Error during sync:', error)
  }
}
