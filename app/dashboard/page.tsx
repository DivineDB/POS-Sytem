"use client"

import { useState, useMemo, useEffect } from "react"
import { Sidebar } from "@/components/pos/sidebar"
import { useStore } from "@/lib/store"
import { TrendingUp, IndianRupee, Package, AlertTriangle, ShoppingCart, Calendar, Clock, Eye, EyeOff } from "lucide-react"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { BillService } from "@/lib/bill-service"
import { toast } from "sonner"

export default function DashboardPage() {
  const { products: zustandProducts, orders: zustandOrders, updateProduct: zustandUpdateProduct, priceMode, setPriceMode } = useStore()
  const { products: supabaseProducts, updateProduct: supabaseUpdateProduct } = useSupabaseData()
  
  const [supabaseOrders, setSupabaseOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    const fetchSupabaseOrders = async () => {
      try {
        const bills = await BillService.getBills()
        setSupabaseOrders(bills)
      } catch (err) {
        console.error("Error fetching bills for dashboard:", err)
      } finally {
        setLoadingOrders(false)
      }
    }
    fetchSupabaseOrders()
  }, [])

  // Use Supabase data if available, fallback to Zustand
  const products = supabaseProducts.length > 0 ? supabaseProducts : zustandProducts
  const orders = supabaseProducts.length > 0 ? supabaseOrders : zustandOrders
  const updateProduct = supabaseProducts.length > 0 ? supabaseUpdateProduct : zustandUpdateProduct

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isProfitHidden, setIsProfitHidden] = useState(true)
  const [isRevenueHidden, setIsRevenueHidden] = useState(true)
  const [restockQuantities, setRestockQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const analytics = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalProfit = totalSales * 0.3
    const mostOrdered = [...products].sort((a, b) => b.orderCount - a.orderCount).slice(0, 5)
    const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold)
    return { totalSales, totalProfit, mostOrdered, lowStock }
  }, [products, orders])

  const handleOrderMore = async (productId: string, qty: number) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      try {
        await updateProduct(productId, { stock: product.stock + qty })
        toast.success(`Successfully added ${qty} items to ${product.name} stock!`)
        // Reset local restock quantity state for this product
        setRestockQuantities(prev => {
          const updated = { ...prev }
          delete updated[productId]
          return updated
        })
      } catch (err) {
        console.error("Error updating stock:", err)
        toast.error("Failed to update stock. Please try again.")
      }
    }
  }

  return (
    <main className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        <div className="pos-panel flex-1 flex overflow-hidden">
          <div className="flex gap-3 flex-1 overflow-hidden">
            <Sidebar />
            <section className="flex-1 flex flex-col gap-4 overflow-y-auto p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Monitor your business performance and analytics</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="pos-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <button
                      type="button"
                      onClick={() => setIsRevenueHidden((v) => !v)}
                      className="p-1 rounded-md hover:bg-foreground/5 transition ml-auto"
                      aria-label={isRevenueHidden ? "Show revenue" : "Hide revenue"}
                      title={isRevenueHidden ? "Show revenue" : "Hide revenue"}
                    >
                      {isRevenueHidden ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {isRevenueHidden ? "₹••••••" : `₹${analytics.totalSales.toFixed(2)}`}
                  </div>
                </div>
                <div className="pos-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Total Profit</span>
                    <button
                      type="button"
                      onClick={() => setIsProfitHidden((v) => !v)}
                      className="p-1 rounded-md hover:bg-foreground/5 transition ml-auto"
                      aria-label={isProfitHidden ? "Show profit" : "Hide profit"}
                      title={isProfitHidden ? "Show profit" : "Hide profit"}
                    >
                      {isProfitHidden ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {isProfitHidden ? "₹••••••" : `₹${analytics.totalProfit.toFixed(2)}`}
                  </div>
                </div>
                <div className="pos-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{orders.length}</div>
                </div>
                <div className="pos-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Low Stock Items</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{analytics.lowStock.length}</div>
                </div>
              </div>

              {/* Price Mode Filter */}
              <div className="pos-panel p-4 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {currentTime.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex items-center gap-2 pos-panel p-1 ml-auto">
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
              </div>

              {/* Most Ordered Products */}
              <div className="pos-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold">Most Ordered Products</h2>
                </div>
                <div className="space-y-3">
                  {analytics.mostOrdered.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pos-brand/20 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{priceMode === "retail" ? product.retailPrice : product.wholesalePrice} • Stock:{" "}
                            {product.stock}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{product.orderCount} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Items */}
              <div className="pos-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold">Low Stock Items</h2>
                  <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium">
                    {analytics.lowStock.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {analytics.lowStock.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">All items are well stocked!</p>
                  ) : (
                    analytics.lowStock.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Current Stock: <span className="text-destructive font-semibold">{product.stock}</span> •
                            Threshold: {product.lowStockThreshold}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={restockQuantities[product.id] ?? 50}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0
                              setRestockQuantities(prev => ({ ...prev, [product.id]: val }))
                            }}
                            className="pos-panel w-20 px-2 py-1 text-sm text-center border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                            aria-label="Restock quantity"
                          />
                          <button
                            onClick={() => handleOrderMore(product.id, restockQuantities[product.id] ?? 50)}
                            className="flex items-center gap-2 px-4 py-2 bg-pos-brand text-foreground rounded-lg hover:opacity-90 transition cursor-pointer"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Order More
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
