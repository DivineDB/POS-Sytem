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
  const isA4 = settings.paperSize === "A4"
  const is80mm = settings.paperSize === "80mm"
  const is58mm = settings.paperSize === "58mm"
  const isReceipt = is80mm || is58mm

  // Determine margins
  const leftMargin = isA4 ? 15 : (is80mm ? 4 : 3)
  const rightMargin = isA4 ? 15 : (is80mm ? 4 : 3)
  
  // Calculate dynamic page height for receipts to prevent trailing whitespace
  let pageHeight = 297 // A4 default height in mm
  if (isReceipt) {
    let estimatedHeight = 15 + 12 + 10 // top/bottom margin padding + header title
    
    // Address lines estimation
    if (settings.address) {
      const charLimit = is58mm ? 25 : 35
      const lines = Math.ceil(settings.address.length / charLimit)
      estimatedHeight += lines * 3.5
    }
    
    if (settings.phone) estimatedHeight += 4
    if (settings.gstin) estimatedHeight += 4
    
    // Info details box
    estimatedHeight += is58mm ? 16 : 18
    
    // Table Header + spacing
    estimatedHeight += 8
    
    // Items list (estimating 5.5mm per item line, plus extra if names are long)
    order.items.forEach(item => {
      const maxNameWidth = is58mm ? 18 : 28
      const nameLinesCount = Math.ceil(item.name.length / maxNameWidth)
      estimatedHeight += Math.max(5.5, nameLinesCount * 3.8)
    })
    
    // Separator line + Totals + spacing
    estimatedHeight += 18
    
    // Footer section
    estimatedHeight += 18
    
    // Final height with safety padding
    pageHeight = Math.max(105, Math.ceil(estimatedHeight))
  }

  // Create jsPDF instance
  const pageWidth = isA4 ? 210 : (is80mm ? 80 : 58)
  const doc = isReceipt
    ? new jsPDF({ unit: "mm", format: [pageWidth, pageHeight] })
    : new jsPDF({ unit: "mm", format: "a4" })

  const contentWidth = pageWidth - leftMargin - rightMargin
  let yPosition = isA4 ? 18 : 6

  // Color Palette (Premium Design)
  const colorPrimary: [number, number, number] = [30, 41, 59] // Charcoal/Slate `#1e293b`
  const colorMuted: [number, number, number] = [100, 116, 139] // Muted Steel `#64748b`
  const colorAccent: [number, number, number] = [13, 148, 136] // Teal `#0d9488`
  const colorDark: [number, number, number] = [15, 23, 42] // Off-black `#0f172a`
  const colorLine: [number, number, number] = [226, 232, 240] // Light grey line `#e2e8f0`

  // Helpers
  const formatCurrency = (amount: number) => `Rs. ${amount.toFixed(2)}`
  
  // === HEADER SECTION ===
  doc.setFont("helvetica", "bold")
  doc.setFontSize(isA4 ? 22 : (is80mm ? 12 : 10))
  doc.setTextColor(...colorPrimary)
  
  if (isA4) {
    // Beautiful two column header layout for A4
    doc.text(settings.businessName || "SSG STORE", leftMargin, yPosition)
    doc.setFontSize(14)
    doc.setTextColor(...colorAccent)
    doc.text(settings.titleLabel?.toUpperCase() || "INVOICE RECEIPT", pageWidth - rightMargin, yPosition, { align: "right" })
    
    yPosition += 6
    doc.setDrawColor(...colorAccent)
    doc.setLineWidth(0.6)
    doc.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition)
    yPosition += 8
  } else {
    // Centered header layout for receipts
    doc.text(settings.businessName || "SSG STORE", pageWidth / 2, yPosition, { align: "center" })
    yPosition += is80mm ? 5 : 4
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(is80mm ? 8 : 7.5)
    doc.setTextColor(...colorMuted)
    doc.text(settings.titleLabel || "INVOICE RECEIPT", pageWidth / 2, yPosition, { align: "center" })
    
    yPosition += is80mm ? 4 : 3.5
    doc.setDrawColor(...colorMuted)
    doc.setLineWidth(0.2)
    doc.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition)
    yPosition += is80mm ? 4 : 3
  }

  // Address and contact details
  if (settings.address || settings.phone || settings.gstin) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(isA4 ? 9.5 : (is80mm ? 7.5 : 6.5))
    doc.setTextColor(...colorMuted)
    
    const alignOpt = isA4 ? "left" : "center"
    const textStartX = isA4 ? leftMargin : (pageWidth / 2)

    if (settings.address) {
      const addressWidth = isA4 ? contentWidth * 0.6 : contentWidth
      const addressLines = doc.splitTextToSize(settings.address, addressWidth)
      doc.text(addressLines, textStartX, yPosition, { align: alignOpt })
      yPosition += (Array.isArray(addressLines) ? addressLines.length : 1) * (isA4 ? 4.5 : 3.2)
    }
    
    if (settings.phone) {
      // Avoid emojis that fail encoding. Use clean text.
      doc.text(`Phone: ${settings.phone}`, textStartX, yPosition, { align: alignOpt })
      yPosition += isA4 ? 4.5 : 3.2
    }
    
    if (settings.gstin) {
      doc.text(`GSTIN: ${settings.gstin}`, textStartX, yPosition, { align: alignOpt })
      yPosition += isA4 ? 4.5 : 3.5
    }
  }

  yPosition += isA4 ? 6 : 3

  // === METADATA/INFO BOX ===
  // Elegant box drawing
  const infoBoxHeight = isA4 ? 22 : (is80mm ? 16 : 14.5)
  if (isA4) {
    // Beautiful rounded card on A4
    doc.setFillColor(248, 250, 252) // slate-50 background
    doc.setDrawColor(241, 245, 249) // slate-100 border
    doc.roundedRect(leftMargin, yPosition, contentWidth, infoBoxHeight, 2, 2, 'FD')
  } else {
    // Compact outline or subtle dashes on Receipts
    doc.setDrawColor(...colorLine)
    doc.setLineWidth(0.2)
    doc.rect(leftMargin, yPosition, contentWidth, infoBoxHeight)
  }

  // Populate info box
  doc.setFont("helvetica", "bold")
  doc.setFontSize(isA4 ? 9 : (is80mm ? 7.5 : 6.5))
  doc.setTextColor(...colorDark)

  const textPadding = isA4 ? 5 : 2
  const labelX = leftMargin + textPadding
  const valXOffset = isA4 ? 22 : (is80mm ? 14 : 11)
  
  // Left Column Details
  const isTable = order.tableNumber.toLowerCase().includes("table")
  doc.text(isTable ? "TABLE:" : "CASHIER:", labelX, yPosition + (isA4 ? 7 : 5))
  doc.setFont("helvetica", "normal")
  doc.text(order.tableNumber, labelX + valXOffset, yPosition + (isA4 ? 7 : 5))

  doc.setFont("helvetica", "bold")
  doc.text("DATE:", labelX, yPosition + (isA4 ? 14 : 10))
  doc.setFont("helvetica", "normal")
  doc.text(order.timestamp.toLocaleDateString('en-IN'), labelX + valXOffset, yPosition + (isA4 ? 14 : 10))

  // Right Column Details (A4 and 80mm side-by-side, 58mm stacked if necessary, but 58mm fits too)
  const rightColumnX = isA4 ? pageWidth / 2 + 10 : (is80mm ? pageWidth / 2 + 3 : pageWidth / 2 + 1)
  const rightValOffset = isA4 ? 20 : (is80mm ? 12 : 9)
  
  const billNumber = `BILL-${Date.now().toString().slice(-6)}`
  doc.setFont("helvetica", "bold")
  doc.text("BILL #:", rightColumnX, yPosition + (isA4 ? 7 : 5))
  doc.setFont("helvetica", "normal")
  doc.text(billNumber, rightColumnX + rightValOffset, yPosition + (isA4 ? 7 : 5))

  doc.setFont("helvetica", "bold")
  doc.text("TIME:", rightColumnX, yPosition + (isA4 ? 14 : 10))
  doc.setFont("helvetica", "normal")
  doc.text(order.timestamp.toLocaleTimeString('en-IN', { hour12: true }), rightColumnX + rightValOffset, yPosition + (isA4 ? 14 : 10))

  // Third row (Payment method)
  if (order.paymentMethod) {
    const paymentLabel = order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)
    
    // Render on third row
    doc.setFont("helvetica", "bold")
    doc.text("PAYMENT:", labelX, yPosition + (isA4 ? 20 : 14.5))
    doc.setFont("helvetica", "normal")
    doc.text(paymentLabel, labelX + valXOffset + (isA4 ? 4 : 0), yPosition + (isA4 ? 20 : 14.5))
  }

  yPosition += infoBoxHeight + (isA4 ? 8 : 4)

  // === ITEMS TABLE ===
  // Table headers styling
  const headerHeight = isA4 ? 8 : 5.5
  if (isA4) {
    doc.setFillColor(...colorPrimary)
    doc.rect(leftMargin, yPosition - 1, contentWidth, headerHeight, 'F')
  } else {
    // Thermal receipt gets neat lines above/below header
    doc.setDrawColor(...colorDark)
    doc.setLineWidth(0.25)
    doc.line(leftMargin, yPosition - 1, pageWidth - rightMargin, yPosition - 1)
  }

  // Column Positions
  const colItemX = leftMargin + (isA4 ? 3 : 0)
  const colQtyX = isA4 
    ? leftMargin + 110 
    : (is80mm ? pageWidth - rightMargin - 28 : pageWidth - rightMargin - 21)
  const colPriceX = isA4 
    ? leftMargin + 140 
    : (is80mm ? pageWidth - rightMargin - 14 : pageWidth - rightMargin - 11)
  const colTotalX = pageWidth - rightMargin - (isA4 ? 3 : 0)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(isA4 ? 9.5 : (is80mm ? 7.5 : 6.5))
  
  if (isA4) {
    doc.setTextColor(255, 255, 255) // White text on colored header background
  } else {
    doc.setTextColor(...colorDark) // Dark text
  }

  const verticalCenter = yPosition + (isA4 ? 4.5 : 3)
  doc.text("ITEM", colItemX, verticalCenter)
  doc.text("QTY", colQtyX, verticalCenter, { align: "center" })
  doc.text("PRICE", colPriceX, verticalCenter, { align: "center" })
  doc.text("TOTAL", colTotalX, verticalCenter, { align: "right" })

  if (isReceipt) {
    doc.line(leftMargin, yPosition + headerHeight - 1, pageWidth - rightMargin, yPosition + headerHeight - 1)
  }

  yPosition += headerHeight + (isA4 ? 2 : 1)

  // Table Body Rows
  doc.setTextColor(...colorDark)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(isA4 ? 9 : (is80mm ? 7.5 : 6.5))

  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity
    
    // Row height calculation based on item name length (word wrapping)
    const maxNameWidth = isA4 
      ? (colQtyX - colItemX - 10) 
      : (colQtyX - colItemX - 2)
    const nameLines = doc.splitTextToSize(item.name, maxNameWidth)
    const lineCount = nameLines.length
    
    const rowHeight = isA4 ? 7 : 5.5
    const itemHeight = Math.max(rowHeight, lineCount * (isA4 ? 4.5 : 3.2))

    // Alternating background for A4
    if (isA4 && index % 2 === 0) {
      doc.setFillColor(248, 250, 252) // slate-50
      doc.rect(leftMargin, yPosition - 1.5, contentWidth, itemHeight, 'F')
    }

    // Write multi-line name
    doc.text(nameLines, colItemX, yPosition + (isA4 ? 2.5 : 1.8))

    // Write quantity, unit price, and item total
    const yOffset = yPosition + (isA4 ? 2.5 : 1.8)
    doc.text(item.quantity.toString(), colQtyX, yOffset, { align: "center" })
    doc.text(formatCurrency(item.price), colPriceX, yOffset, { align: "center" })
    
    doc.setFont("helvetica", "bold")
    doc.text(formatCurrency(itemTotal), colTotalX, yOffset, { align: "right" })
    doc.setFont("helvetica", "normal")

    // Draw clean horizontal bottom line for rows in A4
    if (isA4) {
      doc.setDrawColor(241, 245, 249) // slate-100
      doc.setLineWidth(0.3)
      doc.line(leftMargin, yPosition + itemHeight - 1.5, pageWidth - rightMargin, yPosition + itemHeight - 1.5)
    }

    yPosition += itemHeight
  })

  yPosition += isA4 ? 4 : 2

  // === TOTALS SECTION ===
  // Add section separator
  doc.setDrawColor(...colorMuted)
  doc.setLineWidth(0.25)
  
  if (isA4) {
    // Align separator line to totals block on the right
    const lineStartX = pageWidth / 2 + 10
    doc.line(lineStartX, yPosition, pageWidth - rightMargin, yPosition)
  } else {
    // Full width separator line
    doc.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition)
  }
  
  yPosition += isA4 ? 5 : 3.5

  const totalsX = pageWidth - rightMargin - (isA4 ? 3 : 0)
  const labelsX = isA4 
    ? pageWidth / 2 + 25 
    : (is80mm ? pageWidth - rightMargin - 32 : pageWidth - rightMargin - 26)

  // Subtotal Row
  doc.setFont("helvetica", "normal")
  doc.setFontSize(isA4 ? 9.5 : (is80mm ? 7.5 : 6.8))
  doc.setTextColor(...colorMuted)
  
  doc.text("Subtotal:", labelsX, yPosition, { align: "left" })
  doc.text(formatCurrency(order.subtotal), totalsX, yPosition, { align: "right" })
  yPosition += isA4 ? 4.5 : 3.2

  // Tax Row
  const taxPercent = Math.round((settings.taxRate ?? 0) * 10000) / 100
  doc.text(`Tax (${taxPercent}%):`, labelsX, yPosition, { align: "left" })
  doc.text(formatCurrency(order.tax), totalsX, yPosition, { align: "right" })
  yPosition += isA4 ? 6.5 : 4.5

  // Accent line above GRAND TOTAL
  // Draw the accent line cleanly ABOVE grand total text (yPosition) to avoid strikethrough.
  const lineY = yPosition - (isA4 ? 5.5 : 3.8)
  doc.setDrawColor(...(isA4 ? colorAccent : colorDark))
  doc.setLineWidth(isA4 ? 0.45 : 0.25)
  doc.line(labelsX - 2, lineY, totalsX, lineY)

  // Grand Total Row
  doc.setFont("helvetica", "bold")
  doc.setFontSize(isA4 ? 12 : (is80mm ? 9 : 8))
  doc.setTextColor(...(isA4 ? colorAccent : colorDark))
  
  doc.text("TOTAL:", labelsX, yPosition, { align: "left" })
  doc.text(formatCurrency(order.total), totalsX, yPosition, { align: "right" })

  // Double underline under TOTAL for accounting aesthetic
  yPosition += isA4 ? 2 : 1.5
  doc.setLineWidth(0.2)
  doc.line(labelsX - 2, yPosition, totalsX, yPosition)
  
  if (isA4) {
    doc.line(labelsX - 2, yPosition + 0.5, totalsX, yPosition + 0.5)
  }

  // === FOOTER SECTION ===
  // On A4, place it at the bottom. On Receipts, place it directly below totals
  const footerY = isA4 ? pageHeight - 20 : yPosition + 10
  yPosition = footerY

  // Divider
  doc.setDrawColor(...colorLine)
  doc.setLineWidth(0.2)
  if (isA4) {
    doc.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition)
  } else {
    // Draw a neat dashed divider for receipts using line segments
    doc.setLineDashPattern([1.5, 1.5], 0)
    doc.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition)
    doc.setLineDashPattern([], 0) // reset
  }
  
  yPosition += isA4 ? 5 : 3.5

  // Centered footer notes
  doc.setFont("helvetica", "bold")
  doc.setFontSize(isA4 ? 9.5 : (is80mm ? 7.5 : 6.8))
  doc.setTextColor(...colorPrimary)
  doc.text(settings.footerNote || "Thank you for your business!", pageWidth / 2, yPosition, { align: "center" })

  yPosition += isA4 ? 4.5 : 3
  doc.setFont("helvetica", "normal")
  doc.setFontSize(isA4 ? 8 : (is80mm ? 6.5 : 6))
  doc.setTextColor(...colorMuted)
  doc.text("Visit us again soon!", pageWidth / 2, yPosition, { align: "center" })

  // Save the generated document
  const timestamp = order.timestamp.toISOString().slice(0, 19).replace(/[:-]/g, '')
  const sanitizedName = (settings.businessName || "SSG_Store").replace(/\s+/g, '_')
  const filename = `${sanitizedName}_Bill_${order.tableNumber}_${timestamp}.pdf`
  
  doc.save(filename)
}
