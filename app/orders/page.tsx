"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Sidebar } from "@/components/pos/sidebar"
import { SearchBar } from "@/components/pos/search-bar"
import { CategoryCard } from "@/components/pos/category-card"
import { ProductCard } from "@/components/pos/product-card"
import { OrderSummary } from "@/components/pos/order-summary"
import { CartProvider } from "@/components/pos/cart-context"
import { useStore } from "@/lib/store"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { OrdersLoadingSkeleton } from "@/components/pos/loading-skeleton"
import { PageTransition } from "@/components/ui/page-transition"
import { Sparkles, Clock, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  const { categories: zustandCategories, products: zustandProducts, priceMode, setPriceMode } = useStore()
  const { categories: supabaseCategories, products: supabaseProducts, loading } = useSupabaseData()
  
  // Use Supabase data if available, fallback to Zustand
  const categories = supabaseCategories.length > 0 ? supabaseCategories : zustandCategories
  const products = supabaseProducts.length > 0 ? supabaseProducts : zustandProducts
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  const filteredProducts = useMemo(() => {
    let filtered = products

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query))
    }

    return filtered
  }, [products, selectedCategory, debouncedSearchQuery])

  const mostOrderedProducts = useMemo(() => {
    return [...products].sort((a, b) => b.orderCount - a.orderCount).slice(0, 4)
  }, [products])

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }

  if (loading) {
    return <OrdersLoadingSkeleton />
  }

  return (
    <PageTransition>
      <CartProvider>
        <main className="h-full w-full flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
            <div className="pos-panel flex-1 flex overflow-hidden">
              <div className="flex gap-3 flex-1 overflow-hidden">
                <Sidebar />
                <section className="flex-1 flex flex-col gap-3 overflow-hidden">
                  <h1 className="sr-only">New Order Point of Sale Dashboard</h1>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <SearchBar onSearch={setSearchQuery} />
                      {time && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-lg font-medium shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-[var(--pos-brand)]" />
                          <span>{time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span>{time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</span>
                        </div>
                      )}
                    </div>
                  <div className="flex items-center gap-2 pos-panel p-1">
                    <button
                      onClick={() => setPriceMode("retail")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        priceMode === "retail" ? "bg-pos-brand text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Retail
                    </button>
                    <button
                      onClick={() => setPriceMode("wholesale")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        priceMode === "wholesale" ? "bg-pos-brand text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Wholesale
                    </button>
                  </div>
                </div>


                {/* Categories */}
                <div className="grid grid-cols-5 gap-2">
                  <CategoryCard
                    title="All Categories"
                    items={products.length}
                    color="tile-mint"
                    onClick={() => setSelectedCategory(null)}
                    isSelected={selectedCategory === null}
                  />
                  {categories.map((c) => (
                    <CategoryCard
                      key={c.id}
                      title={c.name}
                      items={products.filter((p) => p.category === c.id).length}
                      color={c.color as any}
                      onClick={() => handleCategoryClick(c.id)}
                      isSelected={selectedCategory === c.id}
                    />
                  ))}
                </div>

                 <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600 dark:scrollbar-thumb-gray-400">
                  {filteredProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-xl my-2 mr-2">
                      <div className="p-4 rounded-full bg-muted/50 mb-4">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">No products found</h3>
                      <p className="text-sm text-muted-foreground/75 mt-1 max-w-sm">
                        There are no products matching your selected category or search query. You can add more products in the inventory settings.
                      </p>
                      <Link
                        href="/inventory"
                        className="mt-5 px-4 py-2 text-sm font-medium bg-pos-brand text-foreground rounded-lg hover:opacity-90 transition"
                      >
                        Manage Inventory
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 pb-2 pr-2">
                      {filteredProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          id={p.id}
                          name={p.name}
                          price={priceMode === "retail" ? p.retailPrice : p.wholesalePrice}
                          stock={p.stock}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <OrderSummary priceMode={priceMode} />
            </div>
          </div>
        </div>
      </main>
    </CartProvider>
  </PageTransition>
  )
}
