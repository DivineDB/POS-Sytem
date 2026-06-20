"use client"

import { IndianRupee, QrCode, Wallet, Download, ShoppingBag, CreditCard, User, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useCart } from "./cart-context"
import { generateBillPDF } from "@/lib/pdf-generator"
import { useStore } from "@/lib/store"
import { BillService } from "@/lib/bill-service"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ProductService } from "@/lib/product-service"

type PaymentMethod = "cash" | "online" | "credit"

export function OrderSummary({ priceMode, refetchData }: { priceMode: "retail" | "wholesale"; refetchData?: () => void }) {
  const { items, subtotal, clear } = useCart()
  const { addOrder, incrementProductOrder, decrementStock, invoiceSettings } = useStore()
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const activeProfile = (() => {
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Guest"
    return name
  })()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")

  const tax = subtotal * (invoiceSettings.taxRate ?? 0.1)
  const total = subtotal + tax

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Please add items to the order")
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
        tableNumber: activeProfile,
        type: priceMode,
      }
      addOrder(order)

      // Update local Zustand store
      items.forEach((item) => {
        incrementProductOrder(item.id)
        decrementStock(item.id, item.qty)
      })

      // Update Supabase Database
      try {
        await Promise.all(
          items.map(async (item) => {
            await ProductService.decrementStock(item.id, item.qty)
            await ProductService.incrementOrderCount(item.id)
          })
        )
      } catch (dbError) {
        console.error("Failed to update stock in database:", dbError)
      }

      // Save bill to Supabase
      const billData = await BillService.createBill({
        tableNumber: activeProfile,
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

      let savedToDb = false
      if (billData) {
        console.log("Bill saved to database:", billData.bill_number)
        savedToDb = true
      } else {
        console.warn("Failed to save bill to database")
      }

      // Generate PDF
      generateBillPDF({
        tableNumber: activeProfile,
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
      refetchData?.()

      if (savedToDb) {
        toast.success("Order placed successfully! Bill downloaded and saved to history.")
      } else {
        toast.warning("Order placed and PDF downloaded, but failed to save to database history.")
      }
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 1500)
    } catch (error) {
      console.error("Error generating bill:", error)
      toast.error("Error generating bill. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, select or contenteditable
      const activeEl = document.activeElement
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return
      }

      // Check for Enter key
      if ((e.key === "Enter" || (e.ctrlKey && e.key === "Enter")) && items.length > 0 && !isGenerating && !isSuccess) {
        e.preventDefault()
        handlePlaceOrder()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [items, isGenerating, isSuccess, handlePlaceOrder])

  return (
    <aside className="pos-panel w-96 shrink-0 p-4 flex flex-col gap-4 h-full">
      <header className="flex items-center gap-1.5 shrink-0 pb-2 border-b border-[var(--pos-stroke)]">
        <User className="w-3.5 h-3.5 text-[var(--pos-brand-text)] shrink-0" />
        <span className="text-sm font-semibold text-foreground truncate">{activeProfile}</span>
      </header>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12">
          <div className="p-4 rounded-full bg-muted/50">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium text-muted-foreground">Cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Add items to place an order</p>
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
                      <div className="text-xs text-muted-foreground">₹{i.price.toFixed(2)} × {i.qty}</div>
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
              <div className="text-sm font-medium mb-2">Payment Method</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  aria-pressed={paymentMethod === "cash"}
                  className={`rounded-xl min-h-[52px] text-sm flex flex-col items-center justify-center gap-1.5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand-text)] focus-visible:outline-none focus-visible:ring-offset-background border-2 ${
                    paymentMethod === "cash"
                      ? "border-[var(--pos-brand-text)] bg-muted/40 text-foreground shadow-sm"
                      : "border-[var(--pos-stroke)] bg-[var(--pos-panel)] text-muted-foreground active:text-foreground"
                  }`}
                >
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-[11px] font-semibold tracking-wide">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("online")}
                  aria-pressed={paymentMethod === "online"}
                  className={`rounded-xl min-h-[52px] text-sm flex flex-col items-center justify-center gap-1.5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand-text)] focus-visible:outline-none focus-visible:ring-offset-background border-2 ${
                    paymentMethod === "online"
                      ? "border-[var(--pos-brand-text)] bg-muted/40 text-foreground shadow-sm"
                      : "border-[var(--pos-stroke)] bg-[var(--pos-panel)] text-muted-foreground active:text-foreground"
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  <span className="text-[11px] font-semibold tracking-wide">Online</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("credit")}
                  aria-pressed={paymentMethod === "credit"}
                  className={`rounded-xl min-h-[52px] text-sm flex flex-col items-center justify-center gap-1.5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand-text)] focus-visible:outline-none focus-visible:ring-offset-background border-2 ${
                    paymentMethod === "credit"
                      ? "border-[var(--pos-brand-text)] bg-muted/40 text-foreground shadow-sm"
                      : "border-[var(--pos-stroke)] bg-[var(--pos-panel)] text-muted-foreground active:text-foreground"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[11px] font-semibold tracking-wide">Credit</span>
                </button>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isGenerating || isSuccess}
              className={cn(
                "w-full rounded-full py-3 text-center font-medium transition flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand-text)] focus-visible:outline-none focus-visible:ring-offset-background cursor-pointer",
                isSuccess
                  ? "bg-emerald-600 text-white hover:opacity-100"
                  : "bg-foreground text-background hover:opacity-90 disabled:opacity-50"
              )}
            >
              {isSuccess ? (
                <>
                  <Check size={18} />
                  <span>Order Placed!</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>{isGenerating ? "Generating..." : "Place Order"}</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </aside>
  )
}
