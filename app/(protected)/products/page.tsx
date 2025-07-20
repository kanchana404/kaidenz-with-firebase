"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadButton } from "@/utils/uploadthing"
import { toast } from "sonner"
import { ProductsTable } from "@/components/products-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface ProductSize {
  sizeId: number
  sizeName: string
  stockQuantity: number
  price: number
}

interface Product {
  id: number
  name: string
  description: string
  basePrice: number
  totalStock: number
  categoryId: number
  categoryName: string
  imageUrls: string[]
  sizes: ProductSize[]
}

export default function ProductsPage() {
  const [search, setSearch] = React.useState("")
  const [products, setProducts] = React.useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<{ id: string; label: string }[]>([])
  const [sizes, setSizes] = React.useState<{ id: string; label: string }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // New state for category and size management
  const [newCategory, setNewCategory] = React.useState("")
  const [newSize, setNewSize] = React.useState("")
  const [addingCategory, setAddingCategory] = React.useState(false)
  const [addingSize, setAddingSize] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("products")
  const [editingCategory, setEditingCategory] = React.useState<{ id: string; name: string } | null>(null)
  const [editingSize, setEditingSize] = React.useState<{ id: string; name: string } | null>(null)
  const [deletingCategory, setDeletingCategory] = React.useState<string | null>(null)
  const [deletingSize, setDeletingSize] = React.useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<{ type: 'category' | 'size'; id: string; name: string } | null>(null)
  
  const [newProduct, setNewProduct] = React.useState<{
    name: string;
    description: string;
    basePrice: string;
    imageUrls: string[];
    categoryId: string;
    sizes: Array<{
      sizeId: string;
      stockQuantity: string;
      price: string;
    }>;
  }>({
    name: "",
    description: "",
    basePrice: "",
    imageUrls: [],
    categoryId: "",
    sizes: [],
  })

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching products...")
      const response = await fetch("/api/product")
      console.log("Response status:", response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log("Products result:", result)
      
      if (result.success) {
        setProducts(result.products || [])
        setFilteredProducts(result.products || [])
        console.log("Products loaded:", result.products?.length || 0)
      } else {
        console.error("Failed to fetch products:", result.error)
        setError(result.error || "Failed to fetch products")
        toast("Failed to fetch products", {
          description: result.error || "Unknown error occurred while loading products",
          action: {
            label: "Retry",
            onClick: () => fetchProducts(),
          },
        })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      toast("Error fetching products", {
        description: errorMessage,
        action: {
          label: "Retry",
          onClick: () => fetchProducts(),
        },
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const data: Array<{ id: string; name: string }> = result.categories
          setCategories(data.map((item) => ({
            id: item.id,
            label: item.name
          })))
        } else {
          console.error("Failed to fetch categories:", result.error)
          setCategories([])
        }
      } else {
        console.error("Error fetching categories:", response.status)
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }, [])

  const fetchSizes = React.useCallback(async () => {
    try {
      const response = await fetch("/api/sizes")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const data: Array<{ id: string; name: string }> = result.sizes
          setSizes(data.map((item) => ({
            id: item.id,
            label: item.name
          })))
        } else {
          console.error("Failed to fetch sizes:", result.error)
          setSizes([])
        }
      } else {
        console.error("Error fetching sizes:", response.status)
        setSizes([])
      }
    } catch (error) {
      console.error("Error fetching sizes:", error)
      setSizes([])
    }
  }, [])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) {
      toast("Validation Error", {
        description: "Please enter a category name",
      })
      return
    }

    setAddingCategory(true)
    try {
      const formData = new FormData()
      formData.append("name", newCategory.trim())

      const response = await fetch("/api/categories", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        toast("Category Added Successfully", {
          description: `"${newCategory}" has been added to categories`,
        })
        setNewCategory("")
        fetchCategories() // Refresh the categories list
      } else {
        toast("Failed to Add Category", {
          description: result.error || "An error occurred while adding the category",
        })
      }
    } catch {
      toast("Add Category Failed", {
        description: "Network error occurred. Please check your connection and try again.",
      })
    } finally {
      setAddingCategory(false)
    }
  }

  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSize.trim()) {
      toast("Validation Error", {
        description: "Please enter a size name",
      })
      return
    }

    setAddingSize(true)
    try {
      const formData = new FormData()
      formData.append("name", newSize.trim())

      const response = await fetch("/api/sizes", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        toast("Size Added Successfully", {
          description: `"${newSize}" has been added to sizes`,
        })
        setNewSize("")
        fetchSizes() // Refresh the sizes list
      } else {
        toast("Failed to Add Size", {
          description: result.error || "An error occurred while adding the size",
        })
      }
    } catch {
      toast("Add Size Failed", {
        description: "Network error occurred. Please check your connection and try again.",
      })
    } finally {
      setAddingSize(false)
    }
  }

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      const formData = new FormData()
      formData.append("id", id)
      formData.append("name", name)

      const response = await fetch("/api/categories", {
        method: "PUT",
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        toast("Category Updated Successfully", {
          description: `Category has been updated to "${name}"`,
        })
        setEditingCategory(null)
        fetchCategories() // Refresh the categories list
      } else {
        toast("Failed to Update Category", {
          description: result.error || "An error occurred while updating the category",
        })
      }
    } catch {
      toast("Update Category Failed", {
        description: "Network error occurred. Please check your connection and try again.",
      })
    }
  }

  const handleUpdateSize = async (id: string, name: string) => {
    try {
      const formData = new FormData()
      formData.append("id", id)
      formData.append("name", name)

      const response = await fetch("/api/sizes", {
        method: "PUT",
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        toast("Size Updated Successfully", {
          description: `Size has been updated to "${name}"`,
        })
        setEditingSize(null)
        fetchSizes() // Refresh the sizes list
      } else {
        toast("Failed to Update Size", {
          description: result.error || "An error occurred while updating the size",
        })
      }
    } catch {
      toast("Update Size Failed", {
        description: "Network error occurred. Please check your connection and try again.",
      })
    }
  }

  const handleDeleteCategory = (id: string, name: string) => {
    setDeleteTarget({ type: 'category', id, name })
    setDeleteDialogOpen(true)
  }



  const handleDeleteSize = (id: string, name: string) => {
    setDeleteTarget({ type: 'size', id, name })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'category') {
      setDeletingCategory(deleteTarget.id)
      try {
        const formData = new FormData()
        formData.append("id", deleteTarget.id)
        formData.append("name", deleteTarget.name) // Send the category name

        const response = await fetch("/api/categories", {
          method: "DELETE",
          body: formData,
        })

        const result = await response.json()
        
        if (result.success) {
          toast("Category Deleted Successfully", {
            description: `"${deleteTarget.name}" has been deleted from categories`,
          })
          fetchCategories() // Refresh the categories list
        } else {
          toast("Failed to Delete Category", {
            description: result.error || "An error occurred while deleting the category",
          })
        }
      } catch {
        toast("Delete Category Failed", {
          description: "Network error occurred. Please check your connection and try again.",
        })
      } finally {
        setDeletingCategory(null)
      }
    } else if (deleteTarget.type === 'size') {
      setDeletingSize(deleteTarget.id)
      try {
        const formData = new FormData()
        formData.append("id", deleteTarget.id)

        const response = await fetch("/api/sizes", {
          method: "DELETE",
          body: formData,
        })

        const result = await response.json()
        
        if (result.success) {
          toast("Size Deleted Successfully", {
            description: `"${deleteTarget.name}" has been deleted from sizes`,
          })
          fetchSizes() // Refresh the sizes list
        } else {
          toast("Failed to Delete Size", {
            description: result.error || "An error occurred while deleting the size",
          })
        }
      } catch {
        toast("Delete Size Failed", {
          description: "Network error occurred. Please check your connection and try again.",
        })
      } finally {
        setDeletingSize(null)
      }
    }

    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  React.useEffect(() => {
    // Fetch categories
    fetchCategories()

    // Fetch sizes
    fetchSizes()

    // Fetch products
    fetchProducts()
  }, [fetchProducts, fetchCategories, fetchSizes])



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value
    setSearch(searchTerm)
    setFilteredProducts(
      products.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewProduct({ ...newProduct, [name]: value })
  }

  const handleSizeChange = (index: number, field: string, value: string) => {
    const updatedSizes = [...newProduct.sizes]
    updatedSizes[index] = { ...updatedSizes[index], [field]: value }
    setNewProduct({ ...newProduct, sizes: updatedSizes })
  }

  const addSize = () => {
    setNewProduct({
      ...newProduct,
      sizes: [...newProduct.sizes, { sizeId: "", stockQuantity: "", price: "" }]
    })
  }

  const removeSize = (index: number) => {
    const updatedSizes = newProduct.sizes.filter((_, i) => i !== index)
    setNewProduct({ ...newProduct, sizes: updatedSizes })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || newProduct.sizes.length === 0) {
      toast("Validation Error", {
        description: "Please provide a product name and at least one size",
        action: {
          label: "Fix",
          onClick: () => console.log("Validation error"),
        },
      })
      return
    }

    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          basePrice: parseFloat(newProduct.basePrice),
          imageUrls: newProduct.imageUrls,
          category: parseInt(newProduct.categoryId),
          sizes: newProduct.sizes.map(size => ({
            sizeId: parseInt(size.sizeId),
            stockQuantity: parseInt(size.stockQuantity),
            price: parseFloat(size.price),
          })),
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast("Product Added Successfully", {
          description: `${newProduct.name} has been added to your inventory`,
          action: {
            label: "View Product",
            onClick: () => {
              document.querySelector('.products-table')?.scrollIntoView({ behavior: 'smooth' })
            },
          },
        })
        setNewProduct({
          name: "",
          description: "",
          basePrice: "",
          imageUrls: [],
          categoryId: "",
          sizes: [],
        })
        fetchProducts()
      } else {
        toast("Failed to Add Product", {
          description: result.error || "An error occurred while adding the product",
          action: {
            label: "Retry",
            onClick: () => handleAddProduct(e),
          },
        })
      }
    } catch {
      toast("Add Product Failed", {
        description: "Network error occurred. Please check your connection and try again.",
        action: {
          label: "Retry",
          onClick: () => handleAddProduct(e),
        },
      })
    }
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <h1 className="text-2xl font-bold px-4 lg:px-6">Products</h1>

              {/* Search Bar */}
              <div className="px-4 lg:px-6">
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={handleSearch}
                  className="max-w-xs"
                />
              </div>

              {/* Tabs for different sections */}
              <div className="px-4 lg:px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-background border border-border shadow-sm">
                    <TabsTrigger 
                      value="products" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Products
                    </TabsTrigger>
                    <TabsTrigger 
                      value="categories" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Categories
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sizes" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Sizes
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Products Tab */}
                  <TabsContent value="products" className="space-y-4 mt-6">
                    {/* Add Product Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Add New Product</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Product Name</Label>
                              <Input
                                id="name"
                                name="name"
                                placeholder="Enter product name"
                                value={newProduct.name}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="basePrice">Base Price ($)</Label>
                              <Input
                                id="basePrice"
                                name="basePrice"
                                type="number"
                                step="0.01"
                                placeholder="Enter base price"
                                value={newProduct.basePrice}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category">Category</Label>
                              <Select value={newProduct.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="image">Product Image</Label>
                              <UploadButton
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                  if (res && res[0]?.url) {
                                    setNewProduct((prev) => ({
                                      ...prev,
                                      imageUrls: [...prev.imageUrls, ...res.map(r => r.url)]
                                    }))
                                    toast("Image Uploaded Successfully", {
                                      description: `${res.length} image${res.length > 1 ? 's' : ''} added to product`,
                                      action: {
                                        label: "View Images",
                                        onClick: () => console.log("Images uploaded:", res),
                                      },
                                    })
                                  } else {
                                    toast("Image Upload Failed", {
                                      description: "Unable to upload image. Please try again.",
                                      action: {
                                        label: "Retry",
                                        onClick: () => console.log("Retry upload"),
                                      },
                                    })
                                  }
                                }}
                                onUploadError={(error: Error) => {
                                  toast("Upload Error", {
                                    description: error.message,
                                    action: {
                                      label: "Retry",
                                      onClick: () => console.log("Retry upload"),
                                    },
                                  })
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              name="description"
                              placeholder="Enter product description"
                              value={newProduct.description}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          {/* Sizes Section */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Product Sizes & Stock</Label>
                              <Button type="button" variant="outline" size="sm" onClick={addSize}>
                                Add Size
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {newProduct.sizes.map((size, index) => (
                                <div key={index} className="grid grid-cols-3 gap-3 p-3 border rounded-lg">
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium">Size</Label>
                                    <Select 
                                      value={size.sizeId} 
                                      onValueChange={(value) => handleSizeChange(index, "sizeId", value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select size" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {sizes.map((s) => (
                                          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium">Stock</Label>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={size.stockQuantity}
                                      onChange={(e) => handleSizeChange(index, "stockQuantity", e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium">Price ($)</Label>
                                    <div className="flex gap-1">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={size.price}
                                        onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeSize(index)}
                                        className="h-10 w-10 p-0"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {newProduct.sizes.length === 0 && (
                                <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                  No sizes added. Click &quot;Add Size&quot; to add product sizes.
                                </div>
                              )}
                            </div>
                          </div>

                          {newProduct.imageUrls.length > 0 && (
                            <div className="mt-4">
                              <Label>Image Preview</Label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {newProduct.imageUrls.map((url, idx) => (
                                  <div key={idx} className="w-32 h-32 border rounded-lg overflow-hidden">
                                    <img
                                      src={url}
                                      alt={`Product preview ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <Button type="submit" className="w-full md:w-auto">
                            Add Product
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Products Table */}
                    {loading && (
                      <div className="text-center py-8">
                        <div className="text-lg">Loading products...</div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="text-center py-8">
                        <div className="text-red-500 text-lg mb-4">Error: {error}</div>
                        <Button onClick={fetchProducts} variant="outline">
                          Retry
                        </Button>
                      </div>
                    )}
                    
                    {!loading && !error && (
                      <ProductsTable 
                        products={filteredProducts} 
                        categories={categories} 
                        sizes={sizes}
                        onProductUpdate={fetchProducts}
                      />
                    )}
                  </TabsContent>

                  {/* Categories Tab */}
                  <TabsContent value="categories" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Manage Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Add Category Form */}
                          <form onSubmit={handleAddCategory} className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder="Enter new category name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                disabled={addingCategory}
                              />
                            </div>
                            <Button type="submit" disabled={addingCategory || !newCategory.trim()}>
                              {addingCategory ? "Adding..." : "Add Category"}
                            </Button>
                          </form>

                          {/* Categories List */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Existing Categories</Label>
                            <div className="space-y-2">
                              {categories.map((category, index) => (
                                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                  {editingCategory?.id === category.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                      <Input
                                        value={editingCategory.name}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        className="flex-1"
                                        autoFocus
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateCategory(category.id, editingCategory.name)}
                                        disabled={!editingCategory.name.trim()}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingCategory(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="font-medium">{index + 1}. {category.label}</span>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingCategory({ id: category.id, name: category.label })}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDeleteCategory(category.id, category.label)}
                                          disabled={deletingCategory === category.id}
                                        >
                                          {deletingCategory === category.id ? "Deleting..." : "Delete"}
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                            {categories.length === 0 && (
                              <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                No categories found. Add your first category above.
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Sizes Tab */}
                  <TabsContent value="sizes" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Manage Sizes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Add Size Form */}
                          <form onSubmit={handleAddSize} className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder="Enter new size name"
                                value={newSize}
                                onChange={(e) => setNewSize(e.target.value)}
                                disabled={addingSize}
                              />
                            </div>
                            <Button type="submit" disabled={addingSize || !newSize.trim()}>
                              {addingSize ? "Adding..." : "Add Size"}
                            </Button>
                          </form>

                          {/* Sizes List */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Existing Sizes</Label>
                            <div className="space-y-2">
                              {sizes.map((size, index) => (
                                <div key={size.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                  {editingSize?.id === size.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                      <Input
                                        value={editingSize.name}
                                        onChange={(e) => setEditingSize({ ...editingSize, name: e.target.value })}
                                        className="flex-1"
                                        autoFocus
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateSize(size.id, editingSize.name)}
                                        disabled={!editingSize.name.trim()}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingSize(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="font-medium">{index + 1}. {size.label}</span>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingSize({ id: size.id, name: size.label })}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDeleteSize(size.id, size.label)}
                                          disabled={deletingSize === size.id}
                                        >
                                          {deletingSize === size.id ? "Deleting..." : "Delete"}
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                            {sizes.length === 0 && (
                              <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                No sizes found. Add your first size above.
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletingCategory === deleteTarget?.id || deletingSize === deleteTarget?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingCategory === deleteTarget?.id || deletingSize === deleteTarget?.id ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
} 