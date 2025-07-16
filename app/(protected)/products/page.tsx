"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import data from "../../data.json"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductsPage() {
  const [search, setSearch] = React.useState("")
  const [products, setProducts] = React.useState(data)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [newProduct, setNewProduct] = React.useState({
    product: "",
    category: "",
    stock: 0,
    price: 0,
    description: "",
    brand: "",
    availability: "In Stock",
    date: new Date().toISOString().slice(0, 10),
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setProducts(
      data.filter((item) =>
        item.product.toLowerCase().includes(e.target.value.toLowerCase())
      )
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value })
  }

  const handleAvailabilityChange = (value: string) => {
    setNewProduct({ ...newProduct, availability: value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.product) return
    
    // For compatibility with existing DataTable, we'll map our product fields
    const productToAdd = {
      id: products.length + 1,
      product: newProduct.product,
      category: newProduct.category,
      stock: Number(newProduct.stock),
      price: Number(newProduct.price),
      status: newProduct.availability, // Map availability to status for table compatibility
      date: newProduct.date,
    }
    
    setProducts([...products, productToAdd])
    setNewProduct({
      product: "",
      category: "",
      stock: 0,
      price: 0,
      description: "",
      brand: "",
      availability: "In Stock",
      date: new Date().toISOString().slice(0, 10),
    })
    setImagePreview(null)
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
                          <Label htmlFor="product">Product Name</Label>
                          <Input
                            id="product"
                            name="product"
                            placeholder="Enter product name"
                            value={newProduct.product}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="brand">Brand</Label>
                          <Input
                            id="brand"
                            name="brand"
                            placeholder="Enter brand name"
                            value={newProduct.brand}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            name="category"
                            placeholder="Enter category"
                            value={newProduct.category}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock Quantity</Label>
                          <Input
                            id="stock"
                            name="stock"
                            type="number"
                            placeholder="Enter stock quantity"
                            value={newProduct.stock}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="price">Price ($)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            placeholder="Enter price"
                            value={newProduct.price}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="availability">Availability</Label>
                          <Select value={newProduct.availability} onValueChange={handleAvailabilityChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="In Stock">In Stock</SelectItem>
                              <SelectItem value="Low Stock">Low Stock</SelectItem>
                              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                              <SelectItem value="Discontinued">Discontinued</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="image">Product Image</Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
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
                        />
                      </div>
                      
                      {imagePreview && (
                        <div className="mt-4">
                          <Label>Image Preview</Label>
                          <div className="mt-2 w-32 h-32 border rounded-lg overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Product preview"
                              className="w-full h-full object-cover"
                            />
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
                <DataTable data={products} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 