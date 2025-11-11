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
  const leftMargin = isReceipt ? 5 : 20
  const rightMargin = isReceipt ? 5 : 20
  let yPosition = isReceipt ? 10 : 20

  // Header
  doc.setFontSize(isReceipt ? 12 : 20)
  doc.text(settings.businessName || "SSG Store", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 10

  doc.setFontSize(isReceipt ? 8 : 10)
  doc.text(settings.titleLabel || "Bill Receipt", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 8

  if (settings.address || settings.phone || settings.gstin) {
    doc.setFontSize(isReceipt ? 6.5 : 9)
    if (settings.address) {
      doc.text(settings.address, pageWidth / 2, yPosition, { align: "center", maxWidth: pageWidth - 20 })
      yPosition += isReceipt ? 4 : 6
    }
    if (settings.phone) {
      doc.text(`Phone: ${settings.phone}`, pageWidth / 2, yPosition, { align: "center" })
      yPosition += isReceipt ? 3 : 5
    }
    if (settings.gstin) {
      doc.text(`GSTIN: ${settings.gstin}`, pageWidth / 2, yPosition, { align: "center" })
      yPosition += isReceipt ? 4 : 6
    }
  }

  // Table info
  doc.setFontSize(isReceipt ? 8 : 11)
  doc.text(`Table: ${order.tableNumber}`, leftMargin, yPosition)
  yPosition += 6
  doc.text(`Date: ${order.timestamp.toLocaleDateString()}`, leftMargin, yPosition)
  doc.text(`Time: ${order.timestamp.toLocaleTimeString()}`, pageWidth - rightMargin, yPosition, { align: "right" })
  yPosition += 6
  
  // Payment method
  if (order.paymentMethod) {
    const paymentMethodLabel = order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)
    doc.text(`Payment: ${paymentMethodLabel}`, leftMargin, yPosition)
    yPosition += 6
  }
  
  yPosition += 6

  // Items table header
  doc.setFontSize(isReceipt ? 7 : 10)
  doc.setFont("helvetica", "bold")
  const colItemX = leftMargin
  // position numeric columns from the right with fixed widths for receipt size
  let nextColX = pageWidth - rightMargin
  const showTotal = settings.showLineTotal !== false
  const showPrice = settings.showItemPrice !== false
  const showQty = settings.showQuantity !== false

  // decide column positions from right to left
  const colTotalX = showTotal ? nextColX : undefined
  if (showTotal) nextColX -= isReceipt ? 16 : 30
  const colPriceX = showPrice ? nextColX : undefined
  if (showPrice) nextColX -= isReceipt ? 14 : 25
  const colQtyX = showQty ? nextColX : undefined

  doc.text("Item", colItemX, yPosition)
  if (showQty && colQtyX !== undefined) doc.text("Qty", colQtyX, yPosition, { align: "right" })
  if (showPrice && colPriceX !== undefined) doc.text("Price", colPriceX, yPosition, { align: "right" })
  if (showTotal && colTotalX !== undefined) doc.text("Total", colTotalX, yPosition, { align: "right" })
  yPosition += 8

  // Items
  doc.setFont("helvetica", "normal")
  order.items.forEach((item) => {
    const itemTotal = item.price * item.quantity
    const nameRightBound = Math.min(
      ...([colQtyX, colPriceX, colTotalX].filter((x) => typeof x === "number") as number[]),
      pageWidth - rightMargin,
    )
    const nameMaxWidth = Math.max(10, nameRightBound - colItemX - 2)
    const nameLines = doc.splitTextToSize(item.name, nameMaxWidth)
    doc.text(nameLines as unknown as string, colItemX, yPosition)
    if (showQty && colQtyX !== undefined) doc.text(item.quantity.toString(), colQtyX, yPosition, { align: "right" })
    if (showPrice && colPriceX !== undefined) doc.text(`₹${item.price}`, colPriceX, yPosition, { align: "right" })
    if (showTotal && colTotalX !== undefined) doc.text(`₹${itemTotal}`, colTotalX, yPosition, { align: "right" })
    const lineHeight = isReceipt ? 4 : 6
    yPosition += lineHeight * (Array.isArray(nameLines) ? nameLines.length : 1)
  })

  yPosition += 4

  // Totals
  doc.setFont("helvetica", "bold")
  doc.text(`Subtotal: ₹${order.subtotal.toFixed(2)}`, pageWidth - rightMargin, yPosition, { align: "right" })
  yPosition += 6
  const taxPercent = Math.round((settings.taxRate ?? 0) * 10000) / 100
  doc.text(`Tax (${taxPercent}%): ₹${order.tax.toFixed(2)}`, pageWidth - rightMargin, yPosition, { align: "right" })
  yPosition += 8

  doc.setFontSize(isReceipt ? 10 : 12)
  doc.text(`Total: ₹${order.total.toFixed(2)}`, pageWidth - rightMargin, yPosition, { align: "right" })

  // Footer
  yPosition = pageHeight - 20
  doc.setFontSize(isReceipt ? 7 : 8)
  doc.text(settings.footerNote || "Thank you for your order!", pageWidth / 2, yPosition, { align: "center" })

  // Save PDF
  doc.save(`bill-${order.tableNumber}-${Date.now()}.pdf`)
}
