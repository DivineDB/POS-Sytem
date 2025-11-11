"use client"

import { IndianRupee, QrCode, Wallet, Download, ShoppingBag, CreditCard } from "lucide-react"
import { useState } from "react"
import { useCart } from "./cart-context"
import { generateBillPDF } from "@/lib/pdf-generator"
import { useStore } from "@/lib/store"
import { BillService } from "@/lib/bill-service"

type PaymentMethod = "cash" | "online" | "credit"

export function OrderSummary({ priceMode }: { priceMode: "retail" | "wholesale" }) {
  const { items, subtotal, clear } = useCart()
  const { addOrder, incrementProductOrder, decrementStock, invoiceSettings } = useStore()
  const [tableNumber, setTableNumber] = useState("Table 5")
  const [isGenerating, setIsGenerating] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")

  const tax = subtotal * (invoiceSettings.taxRate ?? 0.1)
  const total = subtotal + tax

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      alert("Please add items to the order")
      return
    }

    setIsGenerating(true)
    try {
      const order = {
        id: `order-${Date.now()}`,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.qty,
          price: item.price,
        })),
        total,
        date: new Date().toISOString(),
        tableNumber,
        type: priceMode,
      }
      addOrder(order)

      items.forEach((item) => {
        incrementProductOrder(item.id)
        decrementStock(item.id, item.qty)
      })

      // Save bill to Supabase
      const billData = await BillService.createBill({
        tableNumber,
        type: priceMode,
        paymentMethod,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
        })),
        subtotal,
        tax,
        total,
      })

      if (billData) {
        console.log("Bill saved to database:", billData.bill_number)
      } else {
        console.warn("Failed to save bill to database")
      }

      // Generate PDF
      generateBillPDF({
        tableNumber,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
        })),
        subtotal,
        tax,
        total,
        timestamp: new Date(),
        paymentMethod,
      }, invoiceSettings)

      clear()

      alert("Order placed successfully! Bill downloaded and saved to history.")
    } catch (error) {
      console.error("Error generating bill:", error)
      alert("Error generating bill. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <aside className="pos-panel w-96 shrink-0 p-4 flex flex-col gap-4 h-full">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <div className="text-sm font-semibold">Main Branch</div>
          <div className="text-xs text-foreground/60">{tableNumber}</div>
        </div>
        <button className="pos-panel rounded-full p-2" aria-label="Edit table" />
      </header>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12">
          <div className="p-4 rounded-full bg-muted/50">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium text-muted-foreground">Cart is empty</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Add items to place an order</p>
          </div>
        </div>
      ) : (
        <>
          {/* Scrollable items list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 min-h-0">
            <div className="grid gap-2 pb-2">
              {items.map((i, idx) => (
                <div key={i.id} className="pos-panel flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="pos-panel h-6 w-6 rounded-full grid place-items-center text-xs font-medium">{idx + 1}</span>
                    <div className="text-sm">
                      <div className="font-medium">{i.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {i.qty}</div>
                    </div>
                  </div>
                  <div className="font-semibold">₹{(i.price * i.qty).toFixed(2)}</div>
                </div>
              ))}
              {items.length > 5 && (
                <div className="text-xs text-muted-foreground text-center py-2 border-t border-dashed border-muted-foreground/20">
                  {items.length} items total • Scroll to see all
                </div>
              )}
            </div>
          </div>

          {/* Fixed bottom section */}
          <div className="shrink-0 space-y-4">
            <div className="pos-panel rounded-xl p-4 grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{`Tax ${(invoiceSettings.taxRate * 100).toFixed(0)}%`}</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <hr className="my-1 border-[var(--pos-stroke)]" />
              <div className="flex items-center justify-between text-base">
                <span className="font-medium">Total</span>
                <span className="font-bold">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <div className="text-sm mb-2">Payment Method</div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setPaymentMethod("cash")}
                  className={`pos-panel rounded-lg py-3 text-sm grid place-items-center gap-1 transition-all duration-200 transform ${
                    paymentMethod === "cash" 
                      ? "bg-blue-500 text-white shadow-lg scale-105 border-2 border-blue-400" 
                      : "hover:bg-muted/50 hover:scale-105 hover:shadow-md active:scale-95 active:bg-muted/70"
                  }`}
                >
                  <IndianRupee className={`h-5 w-5 transition-transform duration-200 ${
                    paymentMethod === "cash" ? "scale-110" : ""
                  }`} />
                  <span className="text-xs font-medium">Cash</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("online")}
                  className={`pos-panel rounded-lg py-3 text-sm grid place-items-center gap-1 transition-all duration-200 transform ${
                    paymentMethod === "online" 
                      ? "bg-green-500 text-white shadow-lg scale-105 border-2 border-green-400" 
                      : "hover:bg-muted/50 hover:scale-105 hover:shadow-md active:scale-95 active:bg-muted/70"
                  }`}
                >
                  <QrCode className={`h-5 w-5 transition-transform duration-200 ${
                    paymentMethod === "online" ? "scale-110" : ""
                  }`} />
                  <span className="text-xs font-medium">Online</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("credit")}
                  className={`pos-panel rounded-lg py-3 text-sm grid place-items-center gap-1 transition-all duration-200 transform ${
                    paymentMethod === "credit" 
                      ? "bg-purple-500 text-white shadow-lg scale-105 border-2 border-purple-400" 
                      : "hover:bg-muted/50 hover:scale-105 hover:shadow-md active:scale-95 active:bg-muted/70"
                  }`}
                >
                  <CreditCard className={`h-5 w-5 transition-transform duration-200 ${
                    paymentMethod === "credit" ? "scale-110" : ""
                  }`} />
                  <span className="text-xs font-medium">Credit</span>
                </button>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isGenerating}
              className="w-full rounded-full py-3 text-center font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <Download size={18} />
              {isGenerating ? "Generating..." : "Place Order"}
            </button>
          </div>
        </>
      )}
    </aside>
  )
}
