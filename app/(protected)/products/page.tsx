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
import { UploadButton } from "@/utils/uploadthing"
import { toast } from "sonner"

// Remove hardcoded categories and sizes arrays
// const categories = [
//   { id: "cat1", label: "Clothing" },
//   { id: "cat2", label: "Electronics" },
//   { id: "cat3", label: "Accessories" },
//   { id: "cat4", label: "Other" },
// ];
// const sizes = [
//   { id: "size_s", label: "Small" },
//   { id: "size_m", label: "Medium" },
//   { id: "size_l", label: "Large" },
//   { id: "size_xl", label: "Extra Large" },
// ];

export default function ProductsPage() {
  const [search, setSearch] = React.useState("")
  const [products, setProducts] = React.useState(data)
  const [categories, setCategories] = React.useState<{ id: string; label: string }[]>([])
  const [sizes, setSizes] = React.useState<{ id: string; label: string }[]>([])
  const [newProduct, setNewProduct] = React.useState<{
    name: string;
    description: string;
    price: string;
    qty: string;
    imageUrls: string[];
    sizeId: string; // will store index as string
    categoryId: string; // will store index as string
  }>({
    name: "",
    description: "",
    price: "",
    qty: "",
    imageUrls: [],
    sizeId: "",
    categoryId: "",
  })
  // Remove imagePreview state, we'll show all images

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
  }, [])

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

  const handleSelectChange = (name: string, value: string) => {
    setNewProduct({ ...newProduct, [name]: value })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name) return

    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          qty: newProduct.qty,
          imageUrls: newProduct.imageUrls,
          category: Number(newProduct.categoryId),
          size: Number(newProduct.sizeId),
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success("Product added successfully!")
        setNewProduct({
          name: "",
          description: "",
          price: "",
          qty: "",
          imageUrls: [],
          sizeId: "",
          categoryId: "",
        })
      } else {
        toast.error("Failed to add product")
      }
    } catch {
      toast.error("Failed to add product")
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
                          <Label htmlFor="price">Price ($)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            placeholder="Enter price"
                            value={newProduct.price}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qty">Quantity</Label>
                          <Input
                            id="qty"
                            name="qty"
                            type="number"
                            placeholder="Enter quantity"
                            value={newProduct.qty}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="size">Size</Label>
                          <Select value={newProduct.sizeId} onValueChange={(value) => handleSelectChange("sizeId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {sizes.map((size, idx) => (
                                <SelectItem key={size.id} value={(idx + 1).toString()}>{size.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                                toast.success("Image uploaded successfully!")
                              } else {
                                toast.error("Image upload failed")
                              }
                            }}
                            onUploadError={(error: Error) => {
                              toast.error(`ERROR! ${error.message}`)
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
                <DataTable data={products} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 