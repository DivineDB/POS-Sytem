"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/pos/sidebar'
import { BillService } from '@/lib/bill-service'
import { supabase, BillHistory } from '@/lib/supabase'
import { Receipt, Search, Filter, Calendar, Eye, Download, IndianRupee, QrCode, CreditCard, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { generateBillPDF } from '@/lib/pdf-generator'
import { useStore } from '@/lib/store'

export default function BillHistoryPage() {
  const { invoiceSettings } = useStore()
  const [bills, setBills] = useState<BillHistory[]>([])
  const [filteredBills, setFilteredBills] = useState<BillHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "retail" | "wholesale">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [viewingBill, setViewingBill] = useState<BillHistory | null>(null)

  const getPaymentMethodDisplay = (method: 'cash' | 'online' | 'credit') => {
    switch (method) {
      case 'cash':
        return {
          icon: IndianRupee,
          label: 'Cash',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        }
      case 'online':
        return {
          icon: QrCode,
          label: 'Online',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        }
      case 'credit':
        return {
          icon: CreditCard,
          label: 'Credit',
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20'
        }
      default:
        return {
          icon: IndianRupee,
          label: 'Cash',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20'
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
      const { data, error } = await supabase
        .from('bill_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bills:', error)
        return
      }

      setBills(data || [])
    } catch (error) {
      console.error('Error:', error)
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
        const billDate = new Date(bill.created_at)
        
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
      alert('Error downloading bill. Please try again.')
    }
  }

  const handleShareSummary = async () => {
    const stats = getTotalStats()
    const dateRange = dateFilter === 'all' ? 'All Time' : 
                     dateFilter === 'today' ? 'Today' :
                     dateFilter === 'week' ? 'This Week' : 'This Month'
    
    const shareText = `
📊 Sales Summary - ${invoiceSettings.businessName || 'SSG Store'}

📅 Period: ${dateRange}
📋 Total Bills: ${filteredBills.length}

💰 Revenue Breakdown:
🛒 Retail: ${stats.retailCount} bills - ₹${stats.retailTotal.toFixed(2)}
🏢 Wholesale: ${stats.wholesaleCount} bills - ₹${stats.wholesaleTotal.toFixed(2)}

💸 Total Revenue: ₹${stats.total.toFixed(2)}

${filteredBills.length > 0 ? `
📈 Recent Bills:
${filteredBills.slice(0, 5).map(bill => 
  `• ${bill.bill_number} - ₹${bill.total.toFixed(2)} (${format(new Date(bill.created_at), 'MMM dd')})`
).join('\n')}${filteredBills.length > 5 ? `\n... and ${filteredBills.length - 5} more bills` : ''}
` : ''}
Generated on ${format(new Date(), 'MMM dd, yyyy hh:mm a')}
    `.trim()

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Sales Summary - ${invoiceSettings.businessName || 'SSG Store'}`,
          text: shareText,
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        alert('Sales summary copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing summary:', error)
      if (confirm('Unable to share automatically. Would you like to see the summary to copy manually?')) {
        alert(shareText)
      }
    }
  }

  const handleShareBill = async (bill: BillHistory) => {
    const paymentDisplay = getPaymentMethodDisplay(bill.payment_method || 'cash')
    
    // Create shareable text content
    const shareText = `
🧾 Bill Receipt - ${bill.bill_number}

📅 Date: ${format(new Date(bill.created_at), 'MMM dd, yyyy hh:mm a')}
${bill.table_number.toLowerCase().includes("table") ? "🏪 Table" : "👤 Cashier"}: ${bill.table_number}
💰 Payment: ${paymentDisplay.label}
📦 Type: ${bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}

📋 Items (${bill.items.length}):
${bill.items.map(item => `• ${item.name} x${item.quantity} - ₹${item.total.toFixed(2)}`).join('\n')}

💵 Subtotal: ₹${bill.subtotal.toFixed(2)}
🏷️ Tax: ₹${bill.tax.toFixed(2)}
💸 Total: ₹${bill.total.toFixed(2)}

Generated by ${invoiceSettings.businessName || 'SSG Store'}
    `.trim()

    try {
      // Check if Web Share API is supported (mainly mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: `Bill Receipt - ${bill.bill_number}`,
          text: shareText,
        })
      } else {
        // Fallback for desktop: copy to clipboard
        await navigator.clipboard.writeText(shareText)
        
        // Show success message
        const originalText = 'Share'
        const button = document.querySelector(`[data-bill-id="${bill.id}"] .share-button`)
        if (button) {
          button.textContent = 'Copied!'
          setTimeout(() => {
            button.textContent = originalText
          }, 2000)
        }
        
        // Also show an alert as additional feedback
        alert('Bill details copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing bill:', error)
      
      // Final fallback: show the text in an alert for manual copying
      if (confirm('Unable to share automatically. Would you like to see the bill details to copy manually?')) {
        alert(shareText)
      }
    }
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
                <button
                  onClick={handleShareSummary}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  <Share2 className="h-4 w-4" />
                  Share Summary
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="pos-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Total Bills</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{filteredBills.length}</div>
                </div>
                <div className="pos-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Retail ({stats.retailCount})</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">₹{stats.retailTotal.toFixed(2)}</div>
                </div>
                <div className="pos-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Wholesale ({stats.wholesaleCount})</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">₹{stats.wholesaleTotal.toFixed(2)}</div>
                </div>
                <div className="pos-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">₹{stats.total.toFixed(2)}</div>
                </div>
              </div>

              {/* Filters */}
              <div className="pos-panel p-4 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by bill, cashier, or table..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                    >
                      <option value="all">All Types</option>
                      <option value="retail">Retail</option>
                      <option value="wholesale">Wholesale</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                      className="pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
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
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  bill.type === 'retail' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
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
                                <div>{format(new Date(bill.created_at), 'MMM dd, yyyy')}</div>
                                <div>{format(new Date(bill.created_at), 'hh:mm a')}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1 sm:gap-2" data-bill-id={bill.id}>
                                  <button
                                    onClick={() => setViewingBill(bill)}
                                    className="p-2 sm:p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors touch-manipulation"
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4 sm:h-4 sm:w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleShareBill(bill)}
                                    className="p-2 sm:p-2 hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg transition-colors share-button touch-manipulation"
                                    title="Share Bill"
                                  >
                                    <Share2 className="h-4 w-4 sm:h-4 sm:w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadBill(bill)}
                                    className="p-2 sm:p-2 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors touch-manipulation"
                                    title="Download Bill"
                                  >
                                    <Download className="h-4 w-4 sm:h-4 sm:w-4" />
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
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      viewingBill.type === 'retail' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
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
                      {format(new Date(viewingBill.created_at), 'MMM dd, yyyy hh:mm a')}
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
                  className="flex-1 bg-pos-brand text-foreground px-4 py-3 sm:py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 touch-manipulation"
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
    </main>
  )
}
