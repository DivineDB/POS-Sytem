"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/pos/sidebar"
import { Moon, Sun, Globe, Bell, User, Shield, Receipt, LogOut, Check, Save, Sparkles } from "lucide-react"
import { useStore } from "@/lib/store"
import { useAuth } from "@/context/auth-context"
import { useTheme } from "next-themes"

type TabType = "business" | "preferences" | "account"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("business")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState("en")
  const [notifications, setNotifications] = useState(true)
  const { invoiceSettings, updateInvoiceSettings } = useStore()
  const { user, signOut } = useAuth()
  const [showToast, setShowToast] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? theme : "dark"

  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light"
    setTheme(newTheme)
    triggerSaveFeedback()
  }

  const triggerSaveFeedback = () => {
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  return (
    <main className="h-full w-full flex flex-col overflow-hidden bg-[var(--pos-panel-2)] text-foreground">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[var(--pos-brand)] text-black px-4 py-3 rounded-xl shadow-lg border border-[var(--pos-stroke)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Check className="w-4 h-4 font-bold" />
          <span className="text-sm font-semibold">Settings saved successfully!</span>
        </div>
      )}

      <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
        <div className="pos-panel flex-1 flex overflow-hidden">
          <div className="flex gap-3 flex-1 overflow-hidden">
            <Sidebar />
            
            <section className="flex-1 flex flex-col gap-6 overflow-hidden p-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--pos-stroke)]">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    Settings <Sparkles className="w-5 h-5 text-[var(--pos-brand)]" />
                  </h1>
                  <p className="text-sm text-muted-foreground">Configure your store, layout preferences, and account credentials</p>
                </div>
              </div>

              {/* Main settings area */}
              <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Tabs Selector list */}
                <div className="w-64 flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => setActiveTab("business")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand)] focus-visible:outline-none focus-visible:ring-offset-background ${
                      activeTab === "business"
                        ? "bg-[var(--pos-brand)] text-black shadow-lg shadow-[var(--pos-brand)]/10"
                        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Business & Invoice</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("preferences")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand)] focus-visible:outline-none focus-visible:ring-offset-background ${
                      activeTab === "preferences"
                        ? "bg-[var(--pos-brand)] text-black shadow-lg shadow-[var(--pos-brand)]/10"
                        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>App Preferences</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("account")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand)] focus-visible:outline-none focus-visible:ring-offset-background ${
                      activeTab === "account"
                        ? "bg-[var(--pos-brand)] text-black shadow-lg shadow-[var(--pos-brand)]/10"
                        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile & Security</span>
                  </button>
                </div>

                {/* Tab content panel */}
                <div className="flex-1 pos-panel p-6 overflow-y-auto">
                  {activeTab === "business" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">Invoice Settings</h2>
                        <p className="text-xs text-muted-foreground mt-1">These details will appear on printed receipt PDFs.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="business-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">Business Name</label>
                          <input
                            id="business-name"
                            value={invoiceSettings.businessName}
                            onChange={(e) => updateInvoiceSettings({ businessName: e.target.value })}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            placeholder="Store name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="phone-number" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">Phone number</label>
                          <input
                            id="phone-number"
                            value={invoiceSettings.phone}
                            onChange={(e) => updateInvoiceSettings({ phone: e.target.value })}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            placeholder="+91..."
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label htmlFor="store-address" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">Store Address</label>
                          <textarea
                            id="store-address"
                            value={invoiceSettings.address}
                            onChange={(e) => updateInvoiceSettings({ address: e.target.value })}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            rows={3}
                            placeholder="Street, City, State..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="gstin" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">GSTIN</label>
                          <input
                            id="gstin"
                            value={invoiceSettings.gstin}
                            onChange={(e) => updateInvoiceSettings({ gstin: e.target.value })}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            placeholder="GST number"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="title-label" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">Title Label</label>
                          <select
                            id="title-label"
                            value={invoiceSettings.titleLabel}
                            onChange={(e) => updateInvoiceSettings({ titleLabel: e.target.value })}
                            className="w-full bg-[var(--pos-panel)] border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            <option value="Invoice">Invoice</option>
                            <option value="Bill Receipt">Bill Receipt</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="tax-rate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">Tax Rate (%)</label>
                          <input
                            id="tax-rate"
                            type="number"
                            min={0}
                            step={0.01}
                            value={(invoiceSettings.taxRate * 100).toString()}
                            onChange={(e) => {
                              const v = Number(e.target.value)
                              if (!Number.isNaN(v)) updateInvoiceSettings({ taxRate: v / 100 })
                            }}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="paper-size" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">Paper Size</label>
                          <select
                            id="paper-size"
                            value={invoiceSettings.paperSize}
                            onChange={(e) => updateInvoiceSettings({ paperSize: e.target.value as any })}
                            className="w-full bg-[var(--pos-panel)] border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            <option value="A4">A4 (Standard)</option>
                            <option value="58mm">58mm (Thermal Printer)</option>
                          </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label htmlFor="footer-note" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">Footer Note</label>
                          <input
                            id="footer-note"
                            value={invoiceSettings.footerNote}
                            onChange={(e) => updateInvoiceSettings({ footerNote: e.target.value })}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            placeholder="Thank you message..."
                          />
                        </div>
                      </div>

                      {/* Checkbox columns */}
                      <div className="border-t border-[var(--pos-stroke)] pt-4">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">PDF Columns Display</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <label className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-foreground/5 hover:bg-foreground/5 cursor-pointer transition focus-within:ring-2 focus-within:ring-[var(--pos-brand)] focus-within:ring-offset-2 focus-within:ring-offset-background">
                            <input
                              type="checkbox"
                              checked={invoiceSettings.showItemPrice}
                              onChange={(e) => updateInvoiceSettings({ showItemPrice: e.target.checked })}
                              className="rounded border-foreground/10 bg-foreground/5 text-[var(--pos-brand)] focus:ring-0 focus:ring-offset-0 focus-visible:outline-none"
                            />
                            <span className="text-sm text-foreground">Show Item Price</span>
                          </label>

                          <label className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-foreground/5 hover:bg-foreground/5 cursor-pointer transition focus-within:ring-2 focus-within:ring-[var(--pos-brand)] focus-within:ring-offset-2 focus-within:ring-offset-background">
                            <input
                              type="checkbox"
                              checked={invoiceSettings.showQuantity}
                              onChange={(e) => updateInvoiceSettings({ showQuantity: e.target.checked })}
                              className="rounded border-foreground/10 bg-foreground/5 text-[var(--pos-brand)] focus:ring-0 focus:ring-offset-0 focus-visible:outline-none"
                            />
                            <span className="text-sm text-foreground">Show Quantity</span>
                          </label>

                          <label className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-foreground/5 hover:bg-foreground/5 cursor-pointer transition focus-within:ring-2 focus-within:ring-[var(--pos-brand)] focus-within:ring-offset-2 focus-within:ring-offset-background">
                            <input
                              type="checkbox"
                              checked={invoiceSettings.showLineTotal}
                              onChange={(e) => updateInvoiceSettings({ showLineTotal: e.target.checked })}
                              className="rounded border-foreground/10 bg-foreground/5 text-[var(--pos-brand)] focus:ring-0 focus:ring-offset-0 focus-visible:outline-none"
                            />
                            <span className="text-sm text-foreground">Show Line Total</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={triggerSaveFeedback}
                          className="flex items-center gap-2 bg-[var(--pos-brand)] hover:opacity-90 text-black px-5 py-2.5 rounded-xl font-semibold transition cursor-pointer"
                        >
                          <Save className="w-4 h-4" /> Save Business Details
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "preferences" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">App Preferences</h2>
                        <p className="text-xs text-muted-foreground mt-1">Customize your workspace look and feel</p>
                      </div>

                      {/* Theme selection toggle */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-lg bg-[var(--pos-brand)]/10">
                            {currentTheme === "dark" ? <Moon className="w-5 h-5 text-[var(--pos-brand)]" /> : <Sun className="w-5 h-5 text-amber-500" />}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">Theme</span>
                            <span className="text-xs text-muted-foreground">Toggle between dark and light themes</span>
                          </div>
                        </div>

                        <button
                          onClick={toggleTheme}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand)] focus-visible:outline-none focus-visible:ring-offset-background"
                          role="switch"
                          aria-checked={currentTheme === "dark"}
                          aria-label="Toggle dark theme"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                              currentTheme === "dark" ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Language selection selection */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-lg bg-green-500/10">
                            <Globe className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <label htmlFor="language-select" className="font-semibold text-foreground cursor-pointer block">Display Language</label>
                            <span className="text-xs text-muted-foreground">Choose your system language</span>
                          </div>
                        </div>

                        <select
                          id="language-select"
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value)
                            triggerSaveFeedback()
                          }}
                          className="bg-[var(--pos-panel)] border border-foreground/10 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--pos-brand)] focus-visible:ring-2 focus-visible:ring-[var(--pos-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <option value="en">English (US)</option>
                          <option value="hi">Hindi (हिन्दी)</option>
                          <option value="ta">Tamil (தமிழ்)</option>
                          <option value="te">Telugu (తెలుగు)</option>
                        </select>
                      </div>

                      {/* Stock alerts notifications */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-lg bg-purple-500/10">
                            <Bell className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">Stock Warnings</span>
                            <span className="text-xs text-muted-foreground">Receive notifications when stock is low</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setNotifications(!notifications)
                            triggerSaveFeedback()
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--pos-brand)] focus-visible:outline-none focus-visible:ring-offset-background ${
                            notifications ? "bg-[var(--pos-brand)]" : "bg-foreground/10"
                          }`}
                          role="switch"
                          aria-checked={notifications}
                          aria-label="Toggle low stock notifications"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                              notifications ? "translate-x-6 bg-black" : "translate-x-1 bg-white"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "account" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">Profile & Security</h2>
                        <p className="text-xs text-muted-foreground mt-1">Manage credentials and authentication security details</p>
                      </div>

                      {/* Connected Profile Status card */}
                      <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/5 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[var(--pos-brand)] to-[var(--pos-accent-blue)] flex items-center justify-center font-bold text-black text-lg shrink-0">
                            {user?.email?.[0].toUpperCase() || <User className="w-5 h-5 text-black" />}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user?.email || "Anonymous Profile"}</p>
                            <p className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-medium">
                              <Shield className="w-3.5 h-3.5" /> Authenticated via Supabase
                            </p>
                          </div>
                        </div>

                        {user && (
                          <div className="flex justify-start pt-2">
                            <button
                              onClick={() => signOut()}
                              className="flex items-center gap-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" /> Sign Out from Profile
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Mocked security elements (Premium visual design) */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5 opacity-60">
                          <div>
                            <p className="font-semibold text-foreground text-sm">Two-Factor Authentication</p>
                            <p className="text-xs text-muted-foreground">Increase account protection (Coming soon)</p>
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-foreground/5 text-muted-foreground">Inactive</span>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5 opacity-60">
                          <div>
                            <p className="font-semibold text-foreground text-sm">Reset Password</p>
                            <p className="text-xs text-muted-foreground">Send password recovery email</p>
                          </div>
                          <button disabled className="text-xs font-semibold text-muted-foreground hover:text-foreground transition">
                            Trigger
                          </button>
                        </div>
                      </div>
                    </div>
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
