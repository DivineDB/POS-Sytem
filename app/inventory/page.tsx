"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/pos/sidebar"
import { useStore, type Product } from "@/lib/store"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { CategoryService } from "@/lib/category-service"
import { Plus, Pencil, Trash2, Package } from "lucide-react"
import { toast } from "sonner"

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

  const filteredProducts = useMemo(
    () => products.filter((p) => p.category === selectedCategory),
    [products, selectedCategory],
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
                      className="px-4 py-2 bg-pos-brand text-foreground rounded-lg hover:opacity-90 transition"
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
                              ? "bg-pos-brand text-foreground"
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
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-500" />
                        <h2 className="text-lg font-semibold">
                          {categories.find((c) => c.id === selectedCategory)?.name} Products
                        </h2>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProduct(null)
                          setShowForm(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-pos-brand text-foreground rounded-lg hover:opacity-90 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Product
                      </button>
                    </div>

                    {showForm && (
                      <div className="pos-panel p-4 rounded-lg mb-4 border-l-4 border-green-500">
                        <div className="flex items-center gap-2 mb-3">
                          <Plus className="w-4 h-4 text-green-500" />
                          <h3 className="font-semibold">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        name="name"
                        placeholder="Product Name"
                        defaultValue={editingProduct?.name}
                        required
                        className="w-full pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          name="retailPrice"
                          type="number"
                          placeholder="Retail Price"
                          defaultValue={editingProduct?.retailPrice}
                          required
                          className="pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                        />
                        <input
                          name="wholesalePrice"
                          type="number"
                          placeholder="Wholesale Price"
                          defaultValue={editingProduct?.wholesalePrice}
                          required
                          className="pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                        />
                        <input
                          name="stock"
                          type="number"
                          placeholder="Stock Quantity"
                          defaultValue={editingProduct?.stock}
                          required
                          className="pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                        />
                        <input
                          name="lowStockThreshold"
                          type="number"
                          placeholder="Low Stock Threshold"
                          defaultValue={editingProduct?.lowStockThreshold}
                          required
                          className="pos-panel px-3 py-2 rounded-lg border border-[var(--pos-stroke)] focus:outline-none focus:ring-2 focus:ring-pos-brand"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-pos-brand text-foreground rounded-lg hover:opacity-90 transition"
                        >
                          {editingProduct ? "Update" : "Add"} Product
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false)
                            setEditingProduct(null)
                          }}
                          className="px-4 py-2 pos-panel border border-[var(--pos-stroke)] rounded-lg hover:bg-[var(--pos-panel)] transition"
                        >
                          Cancel
                        </button>
                        </div>
                      </form>
                      </div>
                    )}

                    <div className="space-y-2">
                      {filteredProducts.length === 0 ? (
                        <div className="pos-panel p-8 rounded-lg text-center">
                          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-lg font-medium text-muted-foreground">No products found</p>
                          <p className="text-sm text-muted-foreground/60 mt-1">
                            Add your first product to get started
                          </p>
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <div key={product.id} className="pos-panel p-4 rounded-lg flex items-center justify-between hover:bg-[var(--pos-panel)] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Retail: ₹{product.retailPrice} • Wholesale: ₹{product.wholesalePrice} • Stock:{" "}
                                  <span className={`font-medium ${
                                    product.stock <= product.lowStockThreshold 
                                      ? "text-red-500" 
                                      : "text-green-500"
                                  }`}>
                                    {product.stock}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product)
                                  setShowForm(true)
                                }}
                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition"
                                title="Edit Product"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
