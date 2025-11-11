"use client"

import { useState } from "react"
import { Sidebar } from "@/components/pos/sidebar"
import { Moon, Sun, Globe, Bell, User, Shield, Receipt } from "lucide-react"
import { useStore } from "@/lib/store"

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [language, setLanguage] = useState("en")
  const [notifications, setNotifications] = useState(true)
  const { invoiceSettings, updateInvoiceSettings } = useStore()

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
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
                  <h1 className="text-2xl font-bold">Settings</h1>
                  <p className="text-sm text-muted-foreground">Configure your application preferences and settings</p>
                </div>
              </div>

              {/* Appearance */}
              <div className="pos-panel p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                  <h2 className="text-lg font-semibold">Appearance</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pos-brand focus:ring-offset-2 bg-pos-brand text-white bg-ring mx-0 my-0 px-0 py-0"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        theme === "dark" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="pos-panel p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold">Language</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Display Language</p>
                    <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="pos-panel px-4 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
              </div>

              {/* Notifications */}
              <div className="pos-panel p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-semibold">Notifications</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts for low stock and orders</p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pos-brand focus:ring-offset-2 ${
                      notifications ? "bg-pos-brand" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Invoice Settings */}
              <div className="pos-panel p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold">Invoice Settings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                    <input
                      value={invoiceSettings.businessName}
                      onChange={(e) => updateInvoiceSettings({ businessName: e.target.value })}
                      className="w-full pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                      placeholder="Your business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <input
                      value={invoiceSettings.phone}
                      onChange={(e) => updateInvoiceSettings({ phone: e.target.value })}
                      className="w-full pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                      placeholder="+91 …"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <textarea
                      value={invoiceSettings.address}
                      onChange={(e) => updateInvoiceSettings({ address: e.target.value })}
                      className="w-full pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                      rows={3}
                      placeholder="Street, City, State"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">GSTIN</label>
                    <input
                      value={invoiceSettings.gstin}
                      onChange={(e) => updateInvoiceSettings({ gstin: e.target.value })}
                      className="w-full pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                      placeholder="GSTIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Title Label</label>
                    <select
                      value={invoiceSettings.titleLabel}
                      onChange={(e) => updateInvoiceSettings({ titleLabel: e.target.value })}
                      className="w-full pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                    >
                      <option value="Invoice">Invoice</option>
                      <option value="Bill Receipt">Bill Receipt</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Tax Rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={(invoiceSettings.taxRate * 100).toString()}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        if (!Number.isNaN(v)) updateInvoiceSettings({ taxRate: v / 100 })
                      }}
                      className="w-full pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Paper Size</label>
                    <select
                      value={invoiceSettings.paperSize}
                      onChange={(e) => updateInvoiceSettings({ paperSize: e.target.value as any })}
                      className="w-full pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                    >
                      <option value="A4">A4</option>
                      <option value="58mm">58mm (Receipt)</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Footer Note</label>
                    <input
                      value={invoiceSettings.footerNote}
                      onChange={(e) => updateInvoiceSettings({ footerNote: e.target.value })}
                      className="w-full pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                      placeholder="Thanks message or terms"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={invoiceSettings.showItemPrice}
                      onChange={(e) => updateInvoiceSettings({ showItemPrice: e.target.checked })}
                    />
                    Show Item Price
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={invoiceSettings.showQuantity}
                      onChange={(e) => updateInvoiceSettings({ showQuantity: e.target.checked })}
                    />
                    Show Quantity
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={invoiceSettings.showLineTotal}
                      onChange={(e) => updateInvoiceSettings({ showLineTotal: e.target.checked })}
                    />
                    Show Line Total
                  </label>
                </div>
              </div>

              {/* Account */}
              <div className="pos-panel p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-lg font-semibold">Account</h2>
                </div>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--pos-panel)] transition">
                    <p className="font-medium">Profile Settings</p>
                    <p className="text-sm text-muted-foreground">Update your profile information</p>
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--pos-panel)] transition">
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </button>
                </div>
              </div>

              {/* Security */}
              <div className="pos-panel p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold">Security</h2>
                </div>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--pos-panel)] transition">
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--pos-panel)] transition">
                    <p className="font-medium">Session Management</p>
                    <p className="text-sm text-muted-foreground">Manage active sessions</p>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
