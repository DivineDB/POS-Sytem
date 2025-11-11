import { jsPDF } from "jspdf"
import type { InvoiceSettings } from "./store"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  tableNumber: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  timestamp: Date
  paymentMethod?: 'cash' | 'online' | 'credit'
}

export function generateBillPDF(order: Order, settings: InvoiceSettings): void {
  const isReceipt = settings.paperSize === "58mm"
  const doc = isReceipt
    ? new jsPDF({ unit: "mm", format: [58, 200] })
    : new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const leftMargin = isReceipt ? 4 : 25
  const rightMargin = isReceipt ? 4 : 25
  const contentWidth = pageWidth - leftMargin - rightMargin
  let yPosition = isReceipt ? 8 : 25

  // Colors
  const primaryColor: [number, number, number] = [41, 128, 185] // Professional blue
  const secondaryColor: [number, number, number] = [52, 73, 94] // Dark gray
  const accentColor: [number, number, number] = [231, 76, 60] // Elegant red for totals

  // === MODERN HEADER SECTION ===
  // Business name with elegant styling
  doc.setFont("helvetica", "bold")
  doc.setFontSize(isReceipt ? 14 : 24)
  doc.setTextColor(...primaryColor)
  doc.text(settings.businessName || "SSG STORE", pageWidth / 2, yPosition, { align: "center" })
  yPosition += isReceipt ? 6 : 10

  // Subtitle with refined typography
  doc.setFont("helvetica", "normal")
  doc.setFontSize(isReceipt ? 8 : 12)
  doc.setTextColor(...secondaryColor)
  doc.text(settings.titleLabel || "INVOICE RECEIPT", pageWidth / 2, yPosition, { align: "center" })
  yPosition += isReceipt ? 8 : 12

  // Elegant separator line
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(isReceipt ? 0.3 : 0.5)
  doc.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition)
  yPosition += isReceipt ? 6 : 10

  // Business details with better spacing
  if (settings.address || settings.phone || settings.gstin) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(isReceipt ? 7 : 10)
    doc.setTextColor(...secondaryColor)
    
    if (settings.address) {
      const addressLines = doc.splitTextToSize(settings.address, contentWidth)
      doc.text(addressLines, pageWidth / 2, yPosition, { align: "center" })
      yPosition += (Array.isArray(addressLines) ? addressLines.length : 1) * (isReceipt ? 3 : 5)
    }
    
    if (settings.phone) {
      doc.text(`📞 ${settings.phone}`, pageWidth / 2, yPosition, { align: "center" })
      yPosition += isReceipt ? 3 : 5
    }
    
    if (settings.gstin) {
      doc.text(`GST: ${settings.gstin}`, pageWidth / 2, yPosition, { align: "center" })
      yPosition += isReceipt ? 4 : 6
    }
  }

  yPosition += isReceipt ? 6 : 10

  // === INVOICE DETAILS SECTION ===
  // Modern info box with background
  const infoBoxHeight = isReceipt ? 18 : 25
  doc.setFillColor(248, 249, 250) // Light gray background
  doc.rect(leftMargin, yPosition, contentWidth, infoBoxHeight, 'F')
  
  // Invoice details with better alignment
  yPosition += isReceipt ? 4 : 6
  doc.setFont("helvetica", "bold")
  doc.setFontSize(isReceipt ? 8 : 11)
  doc.setTextColor(...secondaryColor)

  // Left side info
  doc.text("TABLE:", leftMargin + 2, yPosition)
  doc.setFont("helvetica", "normal")
  doc.text(order.tableNumber, leftMargin + (isReceipt ? 15 : 25), yPosition)
  
  // Right side info
  const billNumber = `BILL-${Date.now().toString().slice(-6)}`
  doc.setFont("helvetica", "bold")
  doc.text("BILL #:", pageWidth - rightMargin - (isReceipt ? 20 : 35), yPosition, { align: "left" })
  doc.setFont("helvetica", "normal")
  doc.text(billNumber, pageWidth - rightMargin - 2, yPosition, { align: "right" })
  
  yPosition += isReceipt ? 4 : 6

  // Date and time with icons
  doc.setFont("helvetica", "bold")
  doc.text("DATE:", leftMargin + 2, yPosition)
  doc.setFont("helvetica", "normal")
  doc.text(order.timestamp.toLocaleDateString('en-IN'), leftMargin + (isReceipt ? 15 : 25), yPosition)
  
  doc.setFont("helvetica", "bold")
  doc.text("TIME:", pageWidth - rightMargin - (isReceipt ? 20 : 35), yPosition, { align: "left" })
  doc.setFont("helvetica", "normal")
  doc.text(order.timestamp.toLocaleTimeString('en-IN', { hour12: true }), pageWidth - rightMargin - 2, yPosition, { align: "right" })
  
  yPosition += isReceipt ? 4 : 6

  // Payment method with styling
  if (order.paymentMethod) {
    const paymentIcons = { cash: "💰", online: "📱", credit: "💳" }
    const paymentIcon = paymentIcons[order.paymentMethod] || "💰"
    const paymentLabel = order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)
    
    doc.setFont("helvetica", "bold")
    doc.text("PAYMENT:", leftMargin + 2, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text(`${paymentIcon} ${paymentLabel}`, leftMargin + (isReceipt ? 20 : 30), yPosition)
  }

  yPosition += infoBoxHeight - (isReceipt ? 8 : 12)

  // === ITEMS TABLE SECTION ===
  yPosition += isReceipt ? 6 : 10

  // Table header with modern styling
  const headerHeight = isReceipt ? 6 : 8
  doc.setFillColor(...primaryColor)
  doc.rect(leftMargin, yPosition - 2, contentWidth, headerHeight, 'F')
  
  // Column positions for better alignment
  const colItemX = leftMargin + 2
  const colQtyX = pageWidth - rightMargin - (isReceipt ? 35 : 60)
  const colPriceX = pageWidth - rightMargin - (isReceipt ? 22 : 40)
  const colTotalX = pageWidth - rightMargin - 2

  doc.setFont("helvetica", "bold")
  doc.setFontSize(isReceipt ? 7 : 10)
  doc.setTextColor(255, 255, 255) // White text on blue background
  
  doc.text("ITEM", colItemX, yPosition + (isReceipt ? 3 : 4))
  doc.text("QTY", colQtyX, yPosition + (isReceipt ? 3 : 4), { align: "center" })
  doc.text("PRICE", colPriceX, yPosition + (isReceipt ? 3 : 4), { align: "center" })
  doc.text("TOTAL", colTotalX, yPosition + (isReceipt ? 3 : 4), { align: "right" })
  
  yPosition += headerHeight + (isReceipt ? 2 : 4)

  // Items with alternating row colors
  doc.setTextColor(...secondaryColor)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(isReceipt ? 7 : 9)

  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity
    const rowHeight = isReceipt ? 5 : 7
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 252)
      doc.rect(leftMargin, yPosition - 1, contentWidth, rowHeight, 'F')
    }
    
    // Item name with proper wrapping
    const maxNameWidth = colQtyX - colItemX - 4
    const nameLines = doc.splitTextToSize(item.name, maxNameWidth)
    doc.text(nameLines[0] || item.name, colItemX, yPosition + 2)
    
    // Quantity, price, and total with better formatting
    doc.text(item.quantity.toString(), colQtyX, yPosition + 2, { align: "center" })
    doc.text(`₹${item.price.toFixed(2)}`, colPriceX, yPosition + 2, { align: "center" })
    doc.setFont("helvetica", "bold")
    doc.text(`₹${itemTotal.toFixed(2)}`, colTotalX, yPosition + 2, { align: "right" })
    doc.setFont("helvetica", "normal")
    
    yPosition += rowHeight
  })

  yPosition += isReceipt ? 4 : 8

  // === TOTALS SECTION ===
  // Elegant separator
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(isReceipt ? 0.2 : 0.3)
  doc.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition)
  yPosition += isReceipt ? 4 : 6

  // Subtotal and tax with refined alignment
  const totalsX = pageWidth - rightMargin - 2
  const labelsX = pageWidth - rightMargin - (isReceipt ? 30 : 50)
  
  doc.setFont("helvetica", "normal")
  doc.setFontSize(isReceipt ? 8 : 10)
  doc.setTextColor(...secondaryColor)
  
  doc.text("Subtotal:", labelsX, yPosition, { align: "left" })
  doc.text(`₹${order.subtotal.toFixed(2)}`, totalsX, yPosition, { align: "right" })
  yPosition += isReceipt ? 4 : 6

  const taxPercent = Math.round((settings.taxRate ?? 0) * 10000) / 100
  doc.text(`Tax (${taxPercent}%):`, labelsX, yPosition, { align: "left" })
  doc.text(`₹${order.tax.toFixed(2)}`, totalsX, yPosition, { align: "right" })
  yPosition += isReceipt ? 6 : 8

  // Grand total with emphasis
  doc.setDrawColor(...accentColor)
  doc.setLineWidth(isReceipt ? 0.3 : 0.5)
  doc.line(labelsX - 2, yPosition - 2, totalsX, yPosition - 2)
  
  doc.setFont("helvetica", "bold")
  doc.setFontSize(isReceipt ? 10 : 14)
  doc.setTextColor(...accentColor)
  doc.text("TOTAL:", labelsX, yPosition, { align: "left" })
  doc.text(`₹${order.total.toFixed(2)}`, totalsX, yPosition, { align: "right" })

  // === FOOTER SECTION ===
  yPosition = pageHeight - (isReceipt ? 15 : 25)
  
  // Thank you message with style
  doc.setFont("helvetica", "normal")
  doc.setFontSize(isReceipt ? 7 : 9)
  doc.setTextColor(...secondaryColor)
  doc.text("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", pageWidth / 2, yPosition, { align: "center" })
  yPosition += isReceipt ? 4 : 6
  
  doc.setFont("helvetica", "bold")
  doc.setFontSize(isReceipt ? 8 : 11)
  doc.setTextColor(...primaryColor)
  doc.text(settings.footerNote || "Thank you for your business!", pageWidth / 2, yPosition, { align: "center" })
  yPosition += isReceipt ? 3 : 5
  
  doc.setFont("helvetica", "normal")
  doc.setFontSize(isReceipt ? 6 : 8)
  doc.setTextColor(...secondaryColor)
  doc.text("Visit us again soon!", pageWidth / 2, yPosition, { align: "center" })

  // Generate filename with timestamp
  const timestamp = order.timestamp.toISOString().slice(0, 19).replace(/[:-]/g, '')
  const filename = `${settings.businessName?.replace(/\s+/g, '_') || 'SSG_Store'}_Bill_${order.tableNumber}_${timestamp}.pdf`
  
  // Save PDF
  doc.save(filename)
}
