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

  React.useEffect(() => {
    // Fetch categories
    fetch("http://localhost:8080/kaidenz/GetCategory")
      .then(res => res.json())
      .then((data: string[]) => {
        setCategories(data.map((item, idx) => ({
          id: `cat${idx + 1}`,
          label: item
        })))
      })
      .catch(() => setCategories([]))

    // Fetch sizes
    fetch("http://localhost:8080/kaidenz/GetSizes")
      .then(res => res.json())
      .then((data: string[]) => {
        setSizes(data.map((item, idx) => ({
          id: `size${idx + 1}`,
          label: item
        })))
      })
      .catch(() => setSizes([]))

    // Fetch products
    fetchProducts()
  }, [fetchProducts])

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

              {/* Test Backend Button */}
              <div className="px-4 lg:px-6">
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/test")
                      const result = await response.json()
                      console.log("Test result:", result)
                      if (result.success) {
                        toast("Backend Connection Successful", {
                          description: "Your Java backend is running and accessible",
                          action: {
                            label: "View Details",
                            onClick: () => console.log("Backend details:", result),
                          },
                        })
                      } else {
                        toast("Backend Connection Failed", {
                          description: result.error || "Unable to connect to backend server",
                          action: {
                            label: "Retry",
                            onClick: () => window.location.reload(),
                          },
                        })
                      }
                    } catch (error) {
                      toast("Connection Test Failed", {
                        description: error instanceof Error ? error.message : "Unknown error occurred",
                        action: {
                          label: "Retry",
                          onClick: () => window.location.reload(),
                        },
                      })
                    }
                  }}
                  variant="outline"
                  className="mb-4"
                >
                  Test Backend Connection
                </Button>
              </div>

              {/* Search Bar */}
              <div className="px-4 lg:px-6">
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={handleSearch}
                  className="max-w-xs"
                />
              </div>

              {/* Add Product Form */}
              <div className="px-4 lg:px-6">
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
                              {categories.map((cat, idx) => (
                                <SelectItem key={cat.id} value={(idx + 1).toString()}>{cat.label}</SelectItem>
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
                                    {sizes.map((s, idx) => (
                                      <SelectItem key={s.id} value={(idx + 1).toString()}>{s.label}</SelectItem>
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
              </div>

              {/* Products Table */}
              <div className="px-4 lg:px-6">
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
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 