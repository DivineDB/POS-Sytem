"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/pos/sidebar'
import { BillService } from '@/lib/bill-service'
import { supabase, BillHistory } from '@/lib/supabase'
import { Receipt, Search, Filter, Calendar, Eye, Download, IndianRupee, QrCode, CreditCard, Share2, Copy, Mail, MessageSquare, ChevronDown, Send, X } from 'lucide-react'
import { format } from 'date-fns'
import { generateBillPDF } from '@/lib/pdf-generator'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'

export default function BillHistoryPage() {
  const { invoiceSettings } = useStore()
  const [bills, setBills] = useState<BillHistory[]>([])
  const [filteredBills, setFilteredBills] = useState<BillHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeShareData, setActiveShareData] = useState<{ title: string; text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "retail" | "wholesale">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [viewingBill, setViewingBill] = useState<BillHistory | null>(null)
  const [isTypeOpen, setIsTypeOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)

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
    fetchBills()
  }, [])

  useEffect(() => {
    filterBills()
  }, [bills, searchTerm, typeFilter, dateFilter])

  const fetchBills = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('bill_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching bills:', fetchError)
        setError(fetchError.message || 'Failed to fetch bills from the database.')
        toast.error(`Failed to load bill history: ${fetchError.message}`)
        return
      }

      setBills(data || [])
    } catch (err: any) {
      console.error('Error:', err)
      setError(err?.message || 'An unexpected error occurred.')
      toast.error('An unexpected error occurred while loading bills.')
    } finally {
      setLoading(false)
    }
  }

  const filterBills = () => {
    let filtered = bills

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bill => 
        bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.table_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(bill => bill.type === typeFilter)
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(bill => {
        if (!bill.created_at) return false
        const billDate = new Date(bill.created_at)
        if (isNaN(billDate.getTime())) return false
        
        switch (dateFilter) {
          case "today":
            return billDate >= today
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return billDate >= weekAgo
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return billDate >= monthAgo
          default:
            return true
        }
      })
    }

    setFilteredBills(filtered)
  }

  const getTotalStats = () => {
    const retailBills = filteredBills.filter(b => b.type === "retail")
    const wholesaleBills = filteredBills.filter(b => b.type === "wholesale")
    
    return {
      total: filteredBills.reduce((sum, bill) => sum + bill.total, 0),
      retailTotal: retailBills.reduce((sum, bill) => sum + bill.total, 0),
      wholesaleTotal: wholesaleBills.reduce((sum, bill) => sum + bill.total, 0),
      retailCount: retailBills.length,
      wholesaleCount: wholesaleBills.length
    }
  }

  const handleDownloadBill = (bill: BillHistory) => {
    try {
      generateBillPDF({
        tableNumber: bill.table_number,
        items: bill.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: bill.subtotal,
        tax: bill.tax,
        total: bill.total,
        timestamp: new Date(bill.created_at),
        paymentMethod: bill.payment_method || 'cash',
      }, invoiceSettings)
    } catch (error) {
      console.error('Error downloading bill:', error)
      toast.error('Error downloading bill. Please try again.')
    }
  }

  const handleShareSummary = () => {
    const stats = getTotalStats()
    const dateRange = dateFilter === 'all' ? 'All Time' : 
                     dateFilter === 'today' ? 'Today' :
                     dateFilter === 'week' ? 'This Week' : 'This Month'
    
    const shareText = `
📊 Sales Summary - ${invoiceSettings.businessName || 'SSG Store'}

📅 Period: ${dateRange}
📋 Total Bills: ${filteredBills.length}

💰 Revenue Breakdown:
🛒 Retail: ${stats.retailCount} bills - Rs. ${stats.retailTotal.toFixed(2)}
🏢 Wholesale: ${stats.wholesaleCount} bills - Rs. ${stats.wholesaleTotal.toFixed(2)}

💸 Total Revenue: Rs. ${stats.total.toFixed(2)}

${filteredBills.length > 0 ? `
📈 Recent Bills:
${filteredBills.slice(0, 5).map(bill => 
  `• ${bill.bill_number} - Rs. ${bill.total.toFixed(2)} (${formatDateSafe(bill.created_at, 'MMM dd')})`
).join('\n')}${filteredBills.length > 5 ? `\n... and ${filteredBills.length - 5} more bills` : ''}
` : ''}
Generated on ${formatDateSafe(new Date().toISOString(), 'MMM dd, yyyy hh:mm a')}
    `.trim()

    setActiveShareData({
      title: `Sales Summary (${dateRange})`,
      text: shareText,
    })
  }

  const handleShareBill = (bill: BillHistory) => {
    const paymentDisplay = getPaymentMethodDisplay(bill.payment_method || 'cash')
    
    const shareText = `
🧾 Bill Receipt - ${bill.bill_number}

📅 Date: ${formatDateSafe(bill.created_at, 'MMM dd, yyyy hh:mm a')}
${bill.table_number.toLowerCase().includes("table") ? "🏪 Table" : "👤 Cashier"}: ${bill.table_number}
💰 Payment: ${paymentDisplay.label}
📦 Type: ${bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}

📋 Items (${bill.items.length}):
${bill.items.map(item => `• ${item.name} x${item.quantity} - Rs. ${item.total.toFixed(2)}`).join('\n')}

💵 Subtotal: Rs. ${bill.subtotal.toFixed(2)}
🏷️ Tax: Rs. ${bill.tax.toFixed(2)}
💸 Total: Rs. ${bill.total.toFixed(2)}

Generated by ${invoiceSettings.businessName || 'SSG Store'}
    `.trim()

    setActiveShareData({
      title: `Bill ${bill.bill_number}`,
      text: shareText,
    })
  }

  const stats = getTotalStats()

  return (
    <main className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        <div className="pos-panel flex-1 flex overflow-hidden">
          <div className="flex gap-3 flex-1 overflow-hidden">
            <Sidebar />
            <section className="flex-1 flex flex-col gap-4 overflow-y-auto p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Bill History</h1>
                  <p className="text-sm text-muted-foreground">View and manage all generated bills</p>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-xl flex flex-col gap-2 shadow-sm">
                  <div className="font-bold flex items-center gap-2 text-base text-red-800 dark:text-red-200">
                    <span>⚠️</span> Database Connection Issue
                  </div>
                  <p className="text-sm">
                    We encountered an error trying to connect to the database and retrieve your bill history:
                  </p>
                  <code className="text-xs bg-red-100/50 dark:bg-red-950/40 p-2.5 rounded-lg block font-mono border border-red-200 dark:border-red-900/20 whitespace-pre-wrap break-all text-red-900 dark:text-red-200">
                    {error}
                  </code>
                  <p className="text-xs text-red-700/80 dark:text-red-300/80">
                    Please check your Supabase configuration, connection credentials, and table Row Level Security (RLS) settings.
                  </p>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="pos-panel p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-muted-foreground font-medium">Total Bills</span>
                  </div>
                  <div className="text-2xl font-extrabold mt-1">{filteredBills.length}</div>
                </div>
                <div className="pos-panel p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-muted-foreground font-medium">Retail ({stats.retailCount})</span>
                  </div>
                  <div className="text-2xl font-extrabold mt-1">₹{stats.retailTotal.toFixed(2)}</div>
                </div>
                <div className="pos-panel p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-muted-foreground font-medium">Wholesale ({stats.wholesaleCount})</span>
                  </div>
                  <div className="text-2xl font-extrabold mt-1">₹{stats.wholesaleTotal.toFixed(2)}</div>
                </div>
                <div className="pos-panel p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm text-muted-foreground font-medium">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-extrabold mt-1">₹{stats.total.toFixed(2)}</div>
                </div>
              </div>

              {/* Filters */}
              <div className="pos-panel p-4 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Search by bill, cashier, or table..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand w-80 text-sm"
                    />
                  </div>
                  
                  {/* Type Filter */}
                  <div className="flex items-center gap-2 relative">
                    <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                    {isTypeOpen && <div className="fixed inset-0 z-40" onClick={() => setIsTypeOpen(false)} />}
                    <button
                      type="button"
                      onClick={() => { setIsTypeOpen(!isTypeOpen); setIsDateOpen(false); }}
                      className="pos-panel flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-[var(--pos-stroke)] bg-[var(--pos-panel)] active:bg-muted/50 transition cursor-pointer min-w-[130px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pos-brand z-10"
                    >
                      <span>{typeFilter === 'all' ? 'All Types' : typeFilter === 'retail' ? 'Retail' : 'Wholesale'}</span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>
                    {isTypeOpen && (
                      <div className="absolute top-full left-6 mt-1 w-40 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-xl shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          type="button"
                          onClick={() => { setTypeFilter('all'); setIsTypeOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm active:bg-muted transition cursor-pointer ${typeFilter === 'all' ? 'bg-pos-brand/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-foreground/80'}`}
                        >
                          All Types
                        </button>
                        <button
                          type="button"
                          onClick={() => { setTypeFilter('retail'); setIsTypeOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm active:bg-muted transition cursor-pointer ${typeFilter === 'retail' ? 'bg-pos-brand/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-foreground/80'}`}
                        >
                          Retail
                        </button>
                        <button
                          type="button"
                          onClick={() => { setTypeFilter('wholesale'); setIsTypeOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm active:bg-muted transition cursor-pointer ${typeFilter === 'wholesale' ? 'bg-pos-brand/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-foreground/80'}`}
                        >
                          Wholesale
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-2 relative">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    {isDateOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDateOpen(false)} />}
                    <button
                      type="button"
                      onClick={() => { setIsDateOpen(!isDateOpen); setIsTypeOpen(false); }}
                      className="pos-panel flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-[var(--pos-stroke)] bg-[var(--pos-panel)] active:bg-muted/50 transition cursor-pointer min-w-[130px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pos-brand z-10"
                    >
                      <span>
                        {dateFilter === 'all' ? 'All Time' :
                          dateFilter === 'today' ? 'Today' :
                          dateFilter === 'week' ? 'This Week' : 'This Month'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>
                    {isDateOpen && (
                      <div className="absolute top-full left-6 mt-1 w-40 bg-[var(--pos-panel)] border border-[var(--pos-stroke)] rounded-xl shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          type="button"
                          onClick={() => { setDateFilter('all'); setIsDateOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm active:bg-muted transition cursor-pointer ${dateFilter === 'all' ? 'bg-pos-brand/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-foreground/80'}`}
                        >
                          All Time
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDateFilter('today'); setIsDateOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm active:bg-muted transition cursor-pointer ${dateFilter === 'today' ? 'bg-pos-brand/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-foreground/80'}`}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDateFilter('week'); setIsDateOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm active:bg-muted transition cursor-pointer ${dateFilter === 'week' ? 'bg-pos-brand/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-foreground/80'}`}
                        >
                          This Week
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDateFilter('month'); setIsDateOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm active:bg-muted transition cursor-pointer ${dateFilter === 'month' ? 'bg-pos-brand/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-foreground/80'}`}
                        >
                          This Month
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bills List */}
              <div className="pos-panel rounded-lg overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading bills...</p>
                  </div>
                ) : filteredBills.length === 0 ? (
                  <div className="p-8 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No bills found</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      {bills.length === 0 ? "Generate your first bill to see it here" : "Try adjusting your filters"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-medium">Bill Number</th>
                          <th className="text-left p-4 font-medium">Type</th>
                          <th className="text-left p-4 font-medium">Payment</th>
                          <th className="text-left p-4 font-medium">Items</th>
                          <th className="text-left p-4 font-medium">Total</th>
                          <th className="text-left p-4 font-medium">Date & Time</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBills.map((bill) => {
                          const paymentDisplay = getPaymentMethodDisplay(bill.payment_method || 'cash')
                          const PaymentIcon = paymentDisplay.icon
                          
                          return (
                            <tr key={bill.id} className="border-t border-[var(--pos-stroke)] hover:bg-muted/30 transition-colors">
                              <td className="p-4 font-mono text-sm">{bill.bill_number}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                  bill.type === 'retail' 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/20'
                                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900/20'
                                }`}>
                                  {bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentDisplay.bgColor} ${paymentDisplay.color}`}>
                                  <PaymentIcon className="h-3 w-3" />
                                  {paymentDisplay.label}
                                </div>
                              </td>
                              <td className="p-4">{bill.items.length} items</td>
                              <td className="p-4 font-semibold">₹{bill.total.toFixed(2)}</td>
                              <td className="p-4 text-sm text-muted-foreground">
                                <div>{formatDateSafe(bill.created_at, 'MMM dd, yyyy')}</div>
                                <div>{formatDateSafe(bill.created_at, 'hh:mm a')}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1.5" data-bill-id={bill.id}>
                                  <button
                                    onClick={() => setViewingBill(bill)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors min-h-[40px] touch-manipulation cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    onClick={() => handleShareBill(bill)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg transition-colors share-button min-h-[40px] touch-manipulation cursor-pointer"
                                    title="Share Bill"
                                  >
                                    <Share2 className="h-3.5 w-3.5" />
                                    <span>Share</span>
                                  </button>
                                  <button
                                    onClick={() => handleDownloadBill(bill)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors min-h-[40px] touch-manipulation cursor-pointer"
                                    title="Download Bill"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>PDF</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Bill View Modal */}
      {viewingBill && (() => {
        const paymentDisplay = getPaymentMethodDisplay(viewingBill.payment_method || 'cash')
        const PaymentIcon = paymentDisplay.icon
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="pos-panel p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Bill Details</h2>
                  <p className="text-sm text-muted-foreground">{viewingBill.bill_number}</p>
                </div>
                <button
                  onClick={() => setViewingBill(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
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
                      {viewingBill.type.charAt(0).toUpperCase() + viewingBill.type.slice(1)}
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
                      {formatDateSafe(viewingBill.created_at, 'MMM dd, yyyy hh:mm a')}
                    </p>
                  </div>
                </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {viewingBill.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price} × {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{viewingBill.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{viewingBill.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>₹{viewingBill.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button
                  onClick={() => handleShareBill(viewingBill)}
                  className="flex-1 bg-orange-500 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 touch-manipulation"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium">Share Bill</span>
                </button>
                <button
                  onClick={() => handleDownloadBill(viewingBill)}
                  className="flex-1 bg-pos-brand text-black font-semibold px-4 py-3 sm:py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 touch-manipulation"
                >
                  <Download className="h-4 w-4" />
                  <span className="font-medium">Download PDF</span>
                </button>
                <button
                  onClick={() => setViewingBill(null)}
                  className="px-4 py-3 sm:py-2 pos-panel border border-[var(--pos-stroke)] rounded-lg hover:bg-muted transition touch-manipulation"
                >
                  <span className="font-medium">Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        )
      })()}

      {/* Share Options Modal */}
      {activeShareData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-200">
          <div className="pos-panel p-7 rounded-2xl max-w-md w-full bg-[var(--pos-panel)] border border-[var(--pos-stroke)] shadow-2xl flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--pos-stroke)]">
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">Share Document</h3>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{activeShareData.title}</p>
              </div>
              <button
                onClick={() => setActiveShareData(null)}
                className="p-1.5 hover:bg-muted rounded-xl transition-colors cursor-pointer text-muted-foreground hover:text-foreground active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Document Preview */}
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--pos-stroke)] rounded-xl p-4 max-h-48 overflow-y-auto scrollbar-thin text-xs text-foreground/90 font-mono whitespace-pre-wrap shadow-inner leading-relaxed">
              {activeShareData.text}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-3 gap-3.5 py-1">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(activeShareData.text)
                    toast.success('Copied details to clipboard!')
                  } catch (err) {
                    toast.error('Failed to copy text')
                  }
                  setActiveShareData(null)
                }}
                className="tile tile-blue flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer group gap-2.5 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.03]"
              >
                <Copy className="h-5 w-5 text-neutral-800 dark:text-neutral-900 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-900">Copy Text</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activeShareData.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  toast.success('Opening WhatsApp...')
                  setActiveShareData(null)
                }}
                className="tile tile-mint flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer group gap-2.5 active:scale-95 transition-all duration-200 text-decoration-none shadow-sm hover:shadow-md hover:scale-[1.03]"
              >
                <MessageSquare className="h-5 w-5 text-neutral-800 dark:text-neutral-900 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-900">WhatsApp</span>
              </a>

              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: activeShareData.title,
                        text: activeShareData.text,
                      })
                      toast.success('Shared successfully!')
                    } catch (err) {
                      if (err instanceof Error && err.name !== 'AbortError') {
                        toast.error('Failed to share')
                      }
                    }
                  } else {
                    // Fallback to copying to clipboard
                    try {
                      await navigator.clipboard.writeText(activeShareData.text)
                      toast.success('Web Share not supported. Copied text to clipboard!')
                    } catch (err) {
                      toast.error('Failed to copy text')
                    }
                  }
                  setActiveShareData(null)
                }}
                className="tile tile-purple flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer group gap-2.5 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.03]"
              >
                <Share2 className="h-5 w-5 text-neutral-800 dark:text-neutral-900 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-900">Others...</span>
              </button>
            </div>

            <div className="text-center pt-1.5">
              <button
                onClick={() => setActiveShareData(null)}
                className="w-full py-3 rounded-xl bg-foreground/[0.03] dark:bg-foreground/[0.05] hover:bg-foreground/[0.07] dark:hover:bg-foreground/[0.09] text-foreground font-bold text-sm border border-[var(--pos-stroke)] transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
