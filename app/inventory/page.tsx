"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/pos/sidebar"
import { useStore, type Product } from "@/lib/store"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { CategoryService } from "@/lib/category-service"
import { Plus, Pencil, Trash2, Package, Search, X, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function InventoryPage() {
  const { categories: zustandCategories, products: zustandProducts, addProduct: zustandAddProduct, updateProduct: zustandUpdateProduct, deleteProduct: zustandDeleteProduct, addCategory: zustandAddCategory, deleteCategory: zustandDeleteCategory } = useStore()
  const { 
    categories: supabaseCategories, 
    products: supabaseProducts, 
    loading,
    addProduct: supabaseAddProduct,
    updateProduct: supabaseUpdateProduct,
    deleteProduct: supabaseDeleteProduct,
    addCategory: supabaseAddCategory,
    deleteCategory: supabaseDeleteCategory
  } = useSupabaseData()
  
  // Use Supabase data if available, fallback to Zustand
  const categories = supabaseCategories.length > 0 ? supabaseCategories : zustandCategories
  const products = supabaseProducts.length > 0 ? supabaseProducts : zustandProducts
  const addProduct = supabaseCategories.length > 0 ? supabaseAddProduct : zustandAddProduct
  const updateProduct = supabaseCategories.length > 0 ? supabaseUpdateProduct : zustandUpdateProduct
  const deleteProduct = supabaseCategories.length > 0 ? supabaseDeleteProduct : zustandDeleteProduct
  const addCategory = supabaseCategories.length > 0 ? supabaseAddCategory : zustandAddCategory
  const deleteCategory = supabaseCategories.length > 0 ? supabaseDeleteCategory : zustandDeleteCategory
  
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || "")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = useMemo(
    () => products.filter((p) => p.category === selectedCategory && (
      !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )),
    [products, selectedCategory, searchQuery],
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const productData = {
      id: editingProduct?.id || `product-${Date.now()}`,
      name: formData.get("name") as string,
      retailPrice: Number(formData.get("retailPrice")),
      wholesalePrice: Number(formData.get("wholesalePrice")),
      price: Number(formData.get("retailPrice")),
      category: selectedCategory,
      stock: Number(formData.get("stock")),
      lowStockThreshold: Number(formData.get("lowStockThreshold")),
      orderCount: editingProduct?.orderCount || 0,
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        toast.success("Product updated successfully!")
      } else {
        await addProduct(productData)
        toast.success("Product added successfully!")
      }

      setShowForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error("❌ Error saving product:", error)
      toast.error("Failed to save product. Please try again.")
    }
  }

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, "-"),
        name: newCategoryName,
        color: "tile-blue" as const,
      }
      
      try {
        await addCategory(newCategory)
        setNewCategoryName("")
        toast.success("Category added successfully!")
      } catch (error) {
        console.error("❌ Error adding category:", error)
        toast.error("Failed to add category. Please try again.")
      }
    }
  }

  const executeDeleteCategory = async (categoryId: string) => {
    try {
      console.log("Executing category delete for:", categoryId)
      await deleteCategory(categoryId)
      toast.success("Category deleted successfully!")
      
      // Auto-select another category if the currently selected one was deleted
      if (selectedCategory === categoryId) {
        const remainingCategories = categories.filter((c) => c.id !== categoryId)
        setSelectedCategory(remainingCategories[0]?.id || "")
      }
    } catch (error) {
      console.error("❌ Error deleting category:", error)
      toast.error("Failed to delete category. Error: " + error)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    toast("Delete Category?", {
      description: "All products in this category will also be deleted. This cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => executeDeleteCategory(categoryId),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      duration: 5000,
    })
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
                  <h1 className="text-2xl font-bold">Inventory Management</h1>
                  <p className="text-sm text-muted-foreground">Manage your products and categories</p>
                </div>
              </div>

              {/* Add Category */}
              <div className="pos-panel p-4 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Add New Category</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand text-sm"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-pos-brand text-black font-semibold rounded-lg hover:opacity-90 transition"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 flex-1 overflow-hidden">
                {/* Categories sidebar */}
                <div className="w-64 pos-panel p-4 rounded-lg overflow-y-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Categories</h3>
                  </div>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex-1 text-left px-3 py-2 rounded-lg transition ${
                            selectedCategory === cat.id
                              ? "bg-pos-brand text-black font-semibold shadow-sm"
                              : "hover:bg-[var(--pos-panel)] text-muted-foreground"
                          }`}
                        >
                          {cat.name}
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products list */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                  <div className="pos-panel p-4 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-[var(--pos-accent-purple)]" />
                        <h2 className="text-lg font-bold">
                          {categories.find((c) => c.id === selectedCategory)?.name || "Category"} Products
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pos-panel pl-9 pr-8 py-2 rounded-xl border border-[var(--pos-stroke)] bg-[var(--pos-panel-2)] focus:outline-none focus:ring-2 focus:ring-pos-brand text-sm w-44 sm:w-52 transition-all"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-foreground/5 rounded-full text-muted-foreground hover:text-foreground transition"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setEditingProduct(null)
                            setShowForm(true)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-pos-brand text-black font-bold rounded-xl active:scale-[0.98] transition cursor-pointer shadow-sm hover:opacity-90"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Product</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filteredProducts.length === 0 ? (
                        <div className="pos-panel p-8 rounded-xl text-center bg-[var(--pos-panel-2)]/30 border border-dashed border-[var(--pos-stroke)]">
                          <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                          <p className="text-base font-semibold text-foreground">No products found</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {searchQuery ? "Try refining your search query" : "Add your first product to get started"}
                          </p>
                        </div>
                      ) : (
                        filteredProducts.map((product) => {
                          const isLowStock = product.stock <= product.lowStockThreshold
                          return (
                            <div 
                              key={product.id} 
                              className={cn(
                                "p-4 rounded-xl flex items-center justify-between border transition-all duration-200",
                                isLowStock 
                                  ? "bg-red-500/5 border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.15)] animate-pulse-slow" 
                                  : "pos-panel hover:bg-foreground/[0.01]"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center transition-transform",
                                  isLowStock 
                                    ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                )}>
                                  {isLowStock ? (
                                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                                  ) : (
                                    <Package className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm text-foreground">{product.name}</p>
                                    {isLowStock && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25 uppercase tracking-wide">
                                        Low Stock
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Retail: ₹{product.retailPrice} • Wholesale: ₹{product.wholesalePrice} • Stock:{" "}
                                    <span className={cn(
                                      "font-bold",
                                      isLowStock 
                                        ? "text-red-600 dark:text-red-400" 
                                        : "text-emerald-600 dark:text-emerald-400"
                                    )}>
                                      {product.stock}
                                    </span>
                                    <span className="text-muted-foreground/30 mx-1.5">•</span>
                                    <span>Min: {product.lowStockThreshold}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product)
                                    setShowForm(true)
                                  }}
                                  className="p-2 text-blue-600 dark:text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 active:scale-[0.9] border border-blue-500/10 rounded-xl transition duration-150 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                  title="Edit Product"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteProduct(product.id)}
                                  className="p-2 text-red-600 dark:text-red-450 bg-red-500/5 hover:bg-red-500/10 active:scale-[0.9] border border-red-500/10 rounded-xl transition duration-150 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Slide-over Side Drawer for Add/Edit Product */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          {/* Click outside overlay */}
          <div className="absolute inset-0" onClick={() => { setShowForm(false); setEditingProduct(null); }} />
          
          {/* Drawer content */}
          <div className="relative w-full max-w-md bg-[var(--pos-panel)] border-l border-[var(--pos-stroke)] h-full p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--pos-stroke)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[var(--pos-brand)]/10 text-[var(--pos-brand)] flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{editingProduct ? "Edit Product Details" : "Add New Product"}</h3>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Category: {categories.find((c) => c.id === selectedCategory)?.name || "N/A"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                }}
                className="p-1.5 hover:bg-muted active:bg-muted rounded-xl transition text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5 overflow-y-auto px-1.5 py-1">
              <div className="space-y-2">
                <label htmlFor="prod-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Product Name</label>
                <input
                  id="prod-name"
                  name="name"
                  placeholder="e.g. Cold Brew Coffee"
                  defaultValue={editingProduct?.name}
                  required
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-pos-brand transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="prod-retail" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Retail Price (₹)</label>
                  <input
                    id="prod-retail"
                    name="retailPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 150"
                    defaultValue={editingProduct?.retailPrice}
                    required
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-pos-brand transition"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="prod-wholesale" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Wholesale Price (₹)</label>
                  <input
                    id="prod-wholesale"
                    name="wholesalePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 120"
                    defaultValue={editingProduct?.wholesalePrice}
                    required
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-pos-brand transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="prod-stock" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Stock Quantity</label>
                  <input
                    id="prod-stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    defaultValue={editingProduct?.stock}
                    required
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-pos-brand transition"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="prod-threshold" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Low Stock Alert</label>
                  <input
                    id="prod-threshold"
                    name="lowStockThreshold"
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    defaultValue={editingProduct?.lowStockThreshold}
                    required
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-pos-brand transition"
                  />
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-[var(--pos-stroke)] flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProduct(null)
                  }}
                  className="flex-1 py-3 text-center rounded-xl pos-panel border border-[var(--pos-stroke)] bg-foreground/[0.02] dark:bg-foreground/[0.04] text-foreground hover:bg-muted text-sm font-semibold transition active:scale-[0.98] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-center rounded-xl bg-pos-brand text-black text-sm font-bold transition active:scale-[0.98] cursor-pointer shadow-md shadow-[var(--pos-brand)]/10"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
