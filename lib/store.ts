"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  lowStockThreshold: number
  wholesalePrice: number
  retailPrice: number
  orderCount: number
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface Order {
  id: string
  items: { productId: string; quantity: number; price: number }[]
  total: number
  date: string
  tableNumber: string
  type: "retail" | "wholesale"
}

export interface InvoiceSettings {
  businessName: string
  address: string
  phone: string
  gstin: string
  titleLabel: string
  taxRate: number
  footerNote: string
  paperSize: "A4" | "58mm"
  showItemPrice: boolean
  showQuantity: boolean
  showLineTotal: boolean
}

interface StoreState {
  categories: Category[]
  products: Product[]
  orders: Order[]
  invoiceSettings: InvoiceSettings
  priceMode: "retail" | "wholesale"
  setPriceMode: (mode: "retail" | "wholesale") => void
  addCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addOrder: (order: Order) => void
  incrementProductOrder: (productId: string) => void
  decrementStock: (productId: string, quantity: number) => void
  updateInvoiceSettings: (updates: Partial<InvoiceSettings>) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      categories: [
        { id: "cleaning-agents", name: "Cleaning Agents", color: "tile-pink" },
        { id: "brooms-mops", name: "Brooms & Mops", color: "tile-purple" },
        { id: "brushes", name: "Brushes", color: "tile-blue" },
        { id: "dustpans", name: "Dustpans & Bins", color: "tile-purple" },
        { id: "gloves", name: "Gloves & Protection", color: "tile-pink" },
        { id: "sponges", name: "Sponges & Cloths", color: "tile-mint" },
        { id: "disinfectants", name: "Disinfectants", color: "tile-blue" },
        { id: "accessories", name: "Accessories", color: "tile-purple" },
      ],
      products: [
        {
          id: "floor-cleaner",
          name: "Floor Cleaner 5L",
          retailPrice: 450,
          wholesalePrice: 380,
          price: 450,
          category: "cleaning-agents",
          stock: 45,
          lowStockThreshold: 10,
          orderCount: 120,
        },
        {
          id: "glass-cleaner",
          name: "Glass Cleaner Spray",
          retailPrice: 180,
          wholesalePrice: 150,
          price: 180,
          category: "cleaning-agents",
          stock: 8,
          lowStockThreshold: 15,
          orderCount: 95,
        },
        {
          id: "cotton-mop",
          name: "Cotton Mop Head",
          retailPrice: 320,
          wholesalePrice: 270,
          price: 320,
          category: "brooms-mops",
          stock: 25,
          lowStockThreshold: 8,
          orderCount: 78,
        },
        {
          id: "push-broom",
          name: "Heavy Duty Push Broom",
          retailPrice: 550,
          wholesalePrice: 480,
          price: 550,
          category: "brooms-mops",
          stock: 5,
          lowStockThreshold: 10,
          orderCount: 65,
        },
        {
          id: "toilet-brush",
          name: "Toilet Brush Set",
          retailPrice: 220,
          wholesalePrice: 180,
          price: 220,
          category: "brushes",
          stock: 30,
          lowStockThreshold: 12,
          orderCount: 110,
        },
        {
          id: "scrub-brush",
          name: "Scrubbing Brush",
          retailPrice: 150,
          wholesalePrice: 120,
          price: 150,
          category: "brushes",
          stock: 18,
          lowStockThreshold: 10,
          orderCount: 88,
        },
        {
          id: "dustpan-set",
          name: "Dustpan & Brush Set",
          retailPrice: 280,
          wholesalePrice: 230,
          price: 280,
          category: "dustpans",
          stock: 22,
          lowStockThreshold: 8,
          orderCount: 72,
        },
        {
          id: "waste-bin",
          name: "Plastic Waste Bin 50L",
          retailPrice: 850,
          wholesalePrice: 720,
          price: 850,
          category: "dustpans",
          stock: 12,
          lowStockThreshold: 5,
          orderCount: 45,
        },
        {
          id: "rubber-gloves",
          name: "Rubber Gloves (Pair)",
          retailPrice: 120,
          wholesalePrice: 95,
          price: 120,
          category: "gloves",
          stock: 6,
          lowStockThreshold: 20,
          orderCount: 150,
        },
        {
          id: "microfiber-cloth",
          name: "Microfiber Cloth Pack",
          retailPrice: 200,
          wholesalePrice: 165,
          price: 200,
          category: "sponges",
          stock: 35,
          lowStockThreshold: 15,
          orderCount: 92,
        },
        {
          id: "sponge-pack",
          name: "Kitchen Sponge 10-Pack",
          retailPrice: 180,
          wholesalePrice: 145,
          price: 180,
          category: "sponges",
          stock: 28,
          lowStockThreshold: 12,
          orderCount: 105,
        },
        {
          id: "disinfectant-spray",
          name: "Disinfectant Spray 500ml",
          retailPrice: 250,
          wholesalePrice: 210,
          price: 250,
          category: "disinfectants",
          stock: 7,
          lowStockThreshold: 15,
          orderCount: 130,
        },
      ],
      orders: [],
      priceMode: "retail",
      setPriceMode: (mode) => set({ priceMode: mode }),
      invoiceSettings: {
        businessName: "SSG Store",
        address: "123 Main Street, City, State",
        phone: "+91 98765 43210",
        gstin: "",
        titleLabel: "Bill Receipt",
        taxRate: 0.1,
        footerNote: "Thank you for your order!",
        paperSize: "A4",
        showItemPrice: true,
        showQuantity: true,
        showLineTotal: true,
      },
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          products: state.products.filter((p) => p.category !== id),
        })),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      incrementProductOrder: (productId) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === productId ? { ...p, orderCount: p.orderCount + 1 } : p)),
        })),
      decrementStock: (productId, quantity) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === productId ? { ...p, stock: p.stock - quantity } : p)),
        })),
      updateInvoiceSettings: (updates) =>
        set((state) => ({ invoiceSettings: { ...state.invoiceSettings, ...updates } })),
    }),
    {
      name: "pos-storage",
    },
  ),
)
