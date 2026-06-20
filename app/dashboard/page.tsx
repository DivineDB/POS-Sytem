"use client"

import { useState, useMemo, useEffect } from "react"
import { Sidebar } from "@/components/pos/sidebar"
import { useStore } from "@/lib/store"
import { useAuth } from "@/context/auth-context"
import { 
  TrendingUp, 
  IndianRupee, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Calendar, 
  Clock, 
  Eye, 
  EyeOff, 
  FileText, 
  Printer, 
  PlusCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Receipt,
  Download,
  X,
  QrCode,
  CreditCard
} from "lucide-react"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { BillService } from "@/lib/bill-service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"
import { generateBillPDF } from "@/lib/pdf-generator"

export default function DashboardPage() {
  const { products: zustandProducts, orders: zustandOrders, updateProduct: zustandUpdateProduct, priceMode, setPriceMode, invoiceSettings } = useStore()
  const { products: supabaseProducts, updateProduct: supabaseUpdateProduct } = useSupabaseData()
  const { user } = useAuth()
  
  const [supabaseOrders, setSupabaseOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isProfitHidden, setIsProfitHidden] = useState(true)
  const [isRevenueHidden, setIsRevenueHidden] = useState(true)
  const [restockQuantities, setRestockQuantities] = useState<Record<string, number>>({})
  const [viewingBill, setViewingBill] = useState<any | null>(null)

  const formatDateSafe = (dateStr: string | null | undefined, formatTemplate: string) => {
    if (!dateStr) return 'N/A'
    try {
      const dateObj = new Date(dateStr)
      if (isNaN(dateObj.getTime())) {
        return 'N/A'
      }
      return format(dateObj, formatTemplate)
    } catch (e) {
      console.error('Error formatting date:', e)
      return 'N/A'
    }
  }

  const getPaymentMethodDisplay = (method: 'cash' | 'online' | 'credit') => {
    switch (method) {
      case 'cash':
        return {
          icon: IndianRupee,
          label: 'Cash',
          color: 'text-[oklch(0.4_0.15_250)] dark:text-[var(--pos-accent-blue)]',
          bgColor: 'bg-[var(--pos-accent-blue)]/10 dark:bg-[var(--pos-accent-blue)]/5 border border-[var(--pos-accent-blue)]/30'
        }
      case 'online':
        return {
          icon: QrCode,
          label: 'Online',
          color: 'text-[oklch(0.4_0.15_160)] dark:text-[var(--pos-brand)]',
          bgColor: 'bg-[var(--pos-brand)]/10 dark:bg-[var(--pos-brand)]/5 border border-[var(--pos-brand)]/30'
        }
      case 'credit':
        return {
          icon: CreditCard,
          label: 'Credit',
          color: 'text-[oklch(0.4_0.15_300)] dark:text-[var(--pos-accent-purple)]',
          bgColor: 'bg-[var(--pos-accent-purple)]/10 dark:bg-[var(--pos-accent-purple)]/5 border border-[var(--pos-accent-purple)]/30'
        }
      default:
        return {
          icon: IndianRupee,
          label: 'Cash',
          color: 'text-[oklch(0.4_0.15_250)] dark:text-[var(--pos-accent-blue)]',
          bgColor: 'bg-[var(--pos-accent-blue)]/10 dark:bg-[var(--pos-accent-blue)]/5 border border-[var(--pos-accent-blue)]/30'
        }
    }
  }

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Use Supabase data if available, fallback to Zustand
  const products = supabaseProducts.length > 0 ? supabaseProducts : zustandProducts
  const orders = supabaseProducts.length > 0 ? supabaseOrders : zustandOrders
  const updateProduct = supabaseProducts.length > 0 ? supabaseUpdateProduct : zustandUpdateProduct

  const role = user?.user_metadata?.role || "owner"

  const analytics = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalProfit = totalSales * 0.3
    const mostOrdered = [...products].sort((a, b) => b.orderCount - a.orderCount).slice(0, 4)
    const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold)
    return { totalSales, totalProfit, mostOrdered, lowStock }
  }, [products, orders])

  const maxOrders = useMemo(() => {
    return Math.max(...products.map(p => p.orderCount), 1)
  }, [products])

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

  // Trigger quick mock actions
  const triggerDrawerOpen = () => {
    toast.success("Cash drawer kicked open successfully!", { icon: "💰" })
  }

  const triggerReportPrint = () => {
    toast.success("Daily POS sales report sent to printing queue!", { icon: "🖨️" })
  }

  const triggerLabelsPrint = () => {
    toast.success("Low-stock inventory barcode labels sent to printer!", { icon: "🏷️" })
  }

  return (
    <main className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        <div className="pos-panel flex-1 flex overflow-hidden">
          <div className="flex gap-3 flex-1 overflow-hidden">
            <Sidebar />
            <section className="flex-1 flex flex-col gap-4 overflow-y-auto p-4">
              
              {/* Header section with active user and time */}
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--pos-stroke)] pb-3.5">
                <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Monitor your business performance and analytics</p>
                </div>
                
                {/* Filter and Timestamp Info */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-xl font-medium shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[var(--pos-brand)]" />
                      <span>{currentTime.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <span className="text-muted-foreground/30">•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[var(--pos-brand)]" />
                      <span>{currentTime.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 pos-panel p-1">
                    <button
                      onClick={() => setPriceMode("retail")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        priceMode === "retail" ? "bg-pos-brand text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Retail
                    </button>
                    <button
                      onClick={() => setPriceMode("wholesale")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        priceMode === "wholesale" ? "bg-pos-brand text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Wholesale
                    </button>
                  </div>
                </div>
              </div>

              {/* Contextual Quick Actions Dock (Tailored to Cashier Roles) */}
              <div className="pos-panel p-3.5 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[var(--pos-brand)]" />
                  <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Quick Operations Dock ({role.toUpperCase()})</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {role === "owner" && (
                    <>
                      <Link 
                        href="/orders" 
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pos-brand hover:opacity-90 text-black text-xs font-bold transition duration-200 hover:scale-[1.02] shadow-md shadow-[var(--pos-brand)]/10"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>New Order</span>
                      </Link>
                      <Link 
                        href="/inventory" 
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--pos-stroke)] bg-foreground/[0.02] dark:bg-foreground/[0.04] hover:bg-foreground/[0.05] text-xs font-semibold transition duration-200 hover:scale-[1.02]"
                      >
                        <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Manage Inventory</span>
                      </Link>
                      <button 
                        onClick={triggerReportPrint}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--pos-stroke)] bg-foreground/[0.02] dark:bg-foreground/[0.04] hover:bg-foreground/[0.05] text-xs font-semibold transition duration-200 hover:scale-[1.02] cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Daily Report</span>
                      </button>
                    </>
                  )}

                  {role === "cashier" && (
                    <>
                      <Link 
                        href="/orders" 
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pos-brand hover:opacity-90 text-black text-xs font-bold transition duration-200 hover:scale-[1.02] shadow-md shadow-[var(--pos-brand)]/10"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Create Invoice</span>
                      </Link>
                      <button 
                        onClick={triggerDrawerOpen}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--pos-stroke)] bg-foreground/[0.02] dark:bg-foreground/[0.04] hover:bg-foreground/[0.05] text-xs font-semibold transition duration-200 hover:scale-[1.02] cursor-pointer"
                      >
                        <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Open Drawer</span>
                      </button>
                      <Link 
                        href="/bill-history" 
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--pos-stroke)] bg-foreground/[0.02] dark:bg-foreground/[0.04] hover:bg-foreground/[0.05] text-xs font-semibold transition duration-200 hover:scale-[1.02]"
                      >
                        <Receipt className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span>Bill History</span>
                      </Link>
                    </>
                  )}

                  {role === "worker" && (
                    <>
                      <Link 
                        href="/inventory" 
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pos-brand hover:opacity-90 text-black text-xs font-bold transition duration-200 hover:scale-[1.02] shadow-md shadow-[var(--pos-brand)]/10"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Product</span>
                      </Link>
                      <button 
                        onClick={triggerLabelsPrint}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--pos-stroke)] bg-foreground/[0.02] dark:bg-foreground/[0.04] hover:bg-foreground/[0.05] text-xs font-semibold transition duration-200 hover:scale-[1.02] cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Print Barcodes</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Cards Grid with glow effects and sparklines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="pos-panel p-4 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group overflow-hidden bg-gradient-to-b from-[var(--pos-panel)] to-background/50">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-semibold text-muted-foreground">Total Revenue</span>
                    <button
                      type="button"
                      onClick={() => setIsRevenueHidden((v) => !v)}
                      className="p-1.5 rounded-lg hover:bg-foreground/5 transition ml-auto cursor-pointer text-muted-foreground hover:text-foreground"
                      aria-label={isRevenueHidden ? "Show revenue" : "Hide revenue"}
                      title={isRevenueHidden ? "Show revenue" : "Hide revenue"}
                    >
                      {isRevenueHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-2xl font-black mt-2 tracking-tight">
                    {isRevenueHidden ? "₹••••••" : `₹${analytics.totalSales.toFixed(2)}`}
                  </div>
                </div>

                {/* Total Profit */}
                <div className="pos-panel p-4 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group overflow-hidden bg-gradient-to-b from-[var(--pos-panel)] to-background/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-semibold text-muted-foreground">Total Profit (30%)</span>
                    <button
                      type="button"
                      onClick={() => setIsProfitHidden((v) => !v)}
                      className="p-1.5 rounded-lg hover:bg-foreground/5 transition ml-auto cursor-pointer text-muted-foreground hover:text-foreground"
                      aria-label={isProfitHidden ? "Show profit" : "Hide profit"}
                      title={isProfitHidden ? "Show profit" : "Hide profit"}
                    >
                      {isProfitHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-2xl font-black mt-2 tracking-tight">
                    {isProfitHidden ? "₹••••••" : `₹${analytics.totalProfit.toFixed(2)}`}
                  </div>
                </div>

                {/* Total Orders */}
                <div className="pos-panel p-4 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group overflow-hidden bg-gradient-to-b from-[var(--pos-panel)] to-background/50">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-semibold text-muted-foreground">Total Orders</span>
                  </div>
                  <div className="text-2xl font-black mt-2 tracking-tight">{orders.length}</div>
                </div>

                {/* Low Stock Items */}
                <div className="pos-panel p-4 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group overflow-hidden bg-gradient-to-b from-[var(--pos-panel)] to-background/50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-semibold text-muted-foreground">Low Stock Alerts</span>
                  </div>
                  <div className="text-2xl font-black mt-2 tracking-tight">{analytics.lowStock.length}</div>
                </div>
              </div>

              {/* Two Column Interactive Grid (3 columns layout: 2 cols list/charts + 1 col inventory) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Column 1 (lg:col-span-2) - Sales Analytics */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  
                  {/* Sales Share / Most Ordered products */}
                  <div className="pos-panel p-4 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--pos-stroke)]">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-lg font-semibold">Product Sales Share</h2>
                      </div>
                      <Link href="/orders" className="text-xs text-[var(--pos-brand)] hover:underline font-semibold cursor-pointer">
                        Add Order
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {analytics.mostOrdered.map((product, index) => {
                        const sharePct = Math.round((product.orderCount / maxOrders) * 100)
                        return (
                          <div key={product.id} className="flex flex-col gap-1.5 p-3 rounded-xl bg-foreground/[0.01] border border-[var(--pos-stroke)] hover:bg-foreground/[0.03] transition duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-pos-brand text-black flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {index + 1}
                                </div>
                                <span className="text-xs font-bold text-foreground truncate">{product.name}</span>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <span className="text-xs font-bold text-foreground shrink-0">{product.orderCount} orders</span>
                                <span className="text-[10px] text-muted-foreground shrink-0">({sharePct}%)</span>
                              </div>
                            </div>
                            
                            {/* Horizontal Progress Bar */}
                            <div className="w-full bg-foreground/5 rounded-full h-1.5 overflow-hidden flex">
                              <div 
                                className="bg-gradient-to-r from-[var(--pos-brand)] to-blue-500 h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${sharePct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Live Transactions Timeline Feed */}
                  <div className="pos-panel p-4 rounded-xl flex flex-col gap-4 flex-1">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--pos-stroke)]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-semibold">Recent Transactions</h2>
                      </div>
                      <Link href="/bill-history" className="text-xs text-[var(--pos-brand)] hover:underline font-semibold cursor-pointer">
                        View All
                      </Link>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[300px] scrollbar-thin">
                      {loadingOrders ? (
                        <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                          Loading recent orders...
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                          No transactions processed yet.
                        </div>
                      ) : (
                        orders.slice(0, 5).map((order) => {
                          const date = new Date(order.created_at || order.date)
                          const timeStr = isNaN(date.getTime()) ? "Just now" : date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                          const dateStr = isNaN(date.getTime()) ? "Today" : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          
                          // Payment method display styles
                          const method = order.payment_method || order.paymentMethod || 'cash'
                          const methodLabel = method.charAt(0).toUpperCase() + method.slice(1)
                          const methodColor = method === 'cash' ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25 dark:border-blue-400/20' :
                                              method === 'online' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 dark:border-emerald-400/20' :
                                              'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25 dark:border-purple-400/20'

                          return (
                            <div 
                              key={order.id || order.bill_number} 
                              onClick={() => setViewingBill(order)}
                              className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.01] border border-[var(--pos-stroke)] hover:bg-foreground/[0.03] transition duration-150 cursor-pointer"
                            >
                              <div className="min-w-0 flex-1 flex items-center gap-3">
                                <div className="p-2 bg-foreground/5 rounded-lg text-muted-foreground shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-foreground truncate">{order.bill_number || `Bill ${order.id?.slice(-5)}`}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {order.table_number || order.tableNumber || 'Walk-in'} • {dateStr}, {timeStr}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-right flex items-center gap-3">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${methodColor} shrink-0`}>
                                  {methodLabel}
                                </span>
                                <p className="text-xs font-extrabold text-foreground shrink-0">Rs. {order.total.toFixed(2)}</p>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2 (lg:col-span-1) - Inventory Depletion Gauges */}
                <div className="pos-panel p-4 rounded-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--pos-stroke)]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h2 className="text-lg font-semibold">Low Stock Alert</h2>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-bold shrink-0">
                      {analytics.lowStock.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1 scrollbar-thin">
                    {analytics.lowStock.length === 0 ? (
                      <div className="py-12 text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-foreground">All items are well stocked!</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Inventory levels are currently healthy.</p>
                      </div>
                    ) : (
                      analytics.lowStock.map((product) => {
                        const threshold = product.lowStockThreshold || 10
                        const current = product.stock
                        // Percentage depleted
                        const stockPct = Math.max(0, Math.min(100, (current / threshold) * 100))
                        const isCriticallyLow = current <= threshold / 3
                        
                        return (
                          <div
                            key={product.id}
                            className="flex flex-col gap-2 p-3 rounded-xl bg-destructive/[0.01] border border-destructive/20 hover:bg-destructive/[0.03] transition duration-200"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Stock: <span className={cn("font-bold", isCriticallyLow ? "text-red-600 dark:text-red-450 animate-pulse" : "text-amber-600 dark:text-amber-400")}>{current}</span> / Threshold: {threshold}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-1 shrink-0">
                                <input
                                  type="number"
                                  min="1"
                                  value={restockQuantities[product.id] ?? 50}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0
                                    setRestockQuantities(prev => ({ ...prev, [product.id]: val }))
                                  }}
                                  className="pos-panel w-14 px-1 py-1 text-xs text-center border border-[var(--pos-stroke)] focus:outline-none focus:ring-1 focus:ring-pos-brand rounded-lg"
                                  aria-label="Restock quantity"
                                />
                                <button
                                  onClick={() => handleOrderMore(product.id, restockQuantities[product.id] ?? 50)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-pos-brand text-black font-bold text-xs rounded-lg hover:opacity-90 transition cursor-pointer"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>Order</span>
                                </button>
                              </div>
                            </div>
                            
                            {/* Visual depletion indicator bar */}
                            <div className="w-full bg-foreground/10 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-300", 
                                  isCriticallyLow ? "bg-red-600 dark:bg-red-500" : "bg-amber-600 dark:bg-amber-500"
                                )}
                                style={{ width: `${stockPct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

              </div>

            </section>
          </div>
        </div>
      </div>

      {/* Bill View Modal */}
      {viewingBill && (() => {
        const paymentDisplay = getPaymentMethodDisplay(viewingBill.payment_method || viewingBill.paymentMethod || 'cash')
        const PaymentIcon = paymentDisplay.icon
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="pos-panel p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Bill Details</h2>
                  <p className="text-sm text-muted-foreground">{viewingBill.bill_number || `Bill ${viewingBill.id?.slice(-5)}`}</p>
                </div>
                <button
                  onClick={() => setViewingBill(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold border ${
                      viewingBill.type === 'retail' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/20'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900/20'
                    }`}>
                      {(viewingBill.type || 'retail').charAt(0).toUpperCase() + (viewingBill.type || 'retail').slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentDisplay.bgColor} ${paymentDisplay.color}`}>
                      <PaymentIcon className="h-3 w-3" />
                      {paymentDisplay.label}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-medium text-sm">
                      {formatDateSafe(viewingBill.created_at || viewingBill.date, 'MMM dd, yyyy hh:mm a')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="space-y-2">
                    {(viewingBill.items || []).map((item: any, index: number) => {
                      const itemPrice = item.price || 0
                      const itemQty = item.quantity || item.qty || 1
                      const itemTotal = item.total || (itemPrice * itemQty)
                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name || `Product ${item.productId}`}</p>
                            <p className="text-sm text-muted-foreground">₹{itemPrice.toFixed(2)} × {itemQty}</p>
                          </div>
                          <p className="font-semibold">₹{itemTotal.toFixed(2)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-[var(--pos-stroke)] pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{(viewingBill.subtotal || viewingBill.total * 0.9).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{(viewingBill.tax || viewingBill.total * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-[var(--pos-stroke)] pt-2">
                      <span>Total</span>
                      <span>₹{(viewingBill.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <button
                    onClick={() => {
                      try {
                        generateBillPDF({
                          tableNumber: viewingBill.table_number || viewingBill.tableNumber || 'Walk-in',
                          items: (viewingBill.items || []).map((item: any) => ({
                            id: item.id || item.productId,
                            name: item.name || `Product ${item.productId}`,
                            price: item.price || 0,
                            quantity: item.quantity || item.qty || 1,
                          })),
                          subtotal: viewingBill.subtotal || viewingBill.total * 0.9,
                          tax: viewingBill.tax || viewingBill.total * 0.1,
                          total: viewingBill.total,
                          timestamp: new Date(viewingBill.created_at || viewingBill.date),
                          paymentMethod: viewingBill.payment_method || viewingBill.paymentMethod || 'cash',
                        }, invoiceSettings)
                      } catch (error) {
                        console.error('Error downloading bill from dashboard:', error)
                        toast.error('Error downloading bill. Please try again.')
                      }
                    }}
                    className="flex-1 bg-pos-brand text-black font-bold px-4 py-3 sm:py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span className="font-semibold">Download PDF</span>
                  </button>
                  <button
                    onClick={() => setViewingBill(null)}
                    className="px-4 py-3 sm:py-2 pos-panel border border-[var(--pos-stroke)] rounded-lg hover:bg-muted transition touch-manipulation cursor-pointer"
                  >
                    <span className="font-semibold">Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </main>
  )
}
