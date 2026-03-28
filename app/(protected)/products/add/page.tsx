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
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Image as ImageIcon, Package, Palette, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AddProductPage() {
  const router = useRouter()

  const [categories, setCategories] = React.useState<{ id: string; label: string; imageUrl: string }[]>([])
  const [sizes, setSizes] = React.useState<{ id: string; label: string }[]>([])
  const [colors, setColors] = React.useState<{ id: string; label: string; hexCode: string }[]>([])
  const [uploadingImage, setUploadingImage] = React.useState(false)

  const [newProduct, setNewProduct] = React.useState<{
    name: string;
    description: string;
    basePrice: string;
    imageUrls: string[];
    categoryId: string;
    sizes: Array<{ sizeId: string; stockQuantity: string }>;
    colors: Array<{ colorId: string }>;
  }>({
    name: "",
    description: "",
    basePrice: "",
    imageUrls: [],
    categoryId: "",
    sizes: [],
    colors: [],
  })

  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCategories(result.categories.map((item: any) => ({
            id: item.id,
            label: item.name,
            imageUrl: item.imageUrl || "",
          })))
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }, [])

  const fetchSizes = React.useCallback(async () => {
    try {
      const response = await fetch("/api/sizes")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSizes(result.sizes.map((item: any) => ({ id: item.id, label: item.name })))
        }
      }
    } catch (error) {
      console.error("Error fetching sizes:", error)
    }
  }, [])

  const fetchColors = React.useCallback(async () => {
    try {
      const response = await fetch("/api/colors")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setColors(result.colors.map((color: any) => ({
            id: color.id.toString(),
            label: color.name,
            hexCode: color.hexCode || "",
          })))
        }
      }
    } catch (error) {
      console.error("Error fetching colors:", error)
    }
  }, [])

  React.useEffect(() => {
    fetchCategories()
    fetchSizes()
    fetchColors()
  }, [fetchCategories, fetchSizes, fetchColors])

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

  const removeSize = (index: number) => {
    setNewProduct({ ...newProduct, sizes: newProduct.sizes.filter((_, i) => i !== index) })
  }

  const handleColorSelect = (colorId: string) => {
    if (newProduct.colors.some(c => c.colorId === colorId)) return
    setNewProduct({ ...newProduct, colors: [...newProduct.colors, { colorId }] })
  }

  const removeSelectedColor = (colorId: string) => {
    setNewProduct({ ...newProduct, colors: newProduct.colors.filter(c => c.colorId !== colorId) })
  }

  const getSelectedColorNames = () => {
    return newProduct.colors.map(color => {
      const colorData = colors.find(c => c.id === color.colorId)
      return colorData?.label || "Unknown"
    })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors: string[] = []

    if (!newProduct.name.trim()) validationErrors.push("Product name is required")
    if (!newProduct.description.trim()) validationErrors.push("Product description is required")
    if (!newProduct.basePrice || parseFloat(newProduct.basePrice) <= 0) validationErrors.push("Valid base price is required")
    if (!newProduct.categoryId) validationErrors.push("Product category is required")
    if (newProduct.sizes.length === 0) {
      validationErrors.push("At least one size is required")
    } else {
      newProduct.sizes.forEach((size, index) => {
        if (!size.sizeId) validationErrors.push(`Size ${index + 1}: Size selection is required`)
        if (!size.stockQuantity || parseInt(size.stockQuantity) < 0) validationErrors.push(`Size ${index + 1}: Valid stock quantity is required`)
      })
    }
    if (newProduct.imageUrls.length === 0) validationErrors.push("At least one product image is required")

    if (validationErrors.length > 0) {
      toast("Validation Error", {
        description: (
          <div className="space-y-1">
            <div className="font-medium">Please fix the following issues:</div>
            <ul className="text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ),
        duration: 5000,
      })
      return
    }

    try {
      const requestBody = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        basePrice: parseFloat(newProduct.basePrice),
        imageUrls: newProduct.imageUrls,
        category: newProduct.categoryId || null,
        sizes: newProduct.sizes.map(size => ({
          sizeId: size.sizeId,
          stockQuantity: parseInt(size.stockQuantity),
          price: parseFloat(newProduct.basePrice),
        })),
        colors: newProduct.colors.map(color => ({ colorId: color.colorId })),
      }

      const response = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (result.success) {
        toast("Product Added Successfully", {
          description: `${newProduct.name} has been added to your inventory`,
        })
        router.push("/products")
      } else {
        let errorMessage = result.error || "An error occurred while adding the product"
        if (errorMessage.includes("JsonNull")) errorMessage = "Missing required data. Please check all fields are filled correctly."
        else if (errorMessage.includes("category")) errorMessage = "Category is required. Please select a valid category."
        else if (errorMessage.includes("size")) errorMessage = "Size configuration is invalid. Please check size, stock, and price values."
        else if (errorMessage.includes("color")) errorMessage = "Color selection is invalid. Please check color values."
        else if (errorMessage.includes("image")) errorMessage = "Image upload failed. Please try uploading images again."

        toast("Failed to Add Product", {
          description: errorMessage,
          action: { label: "Retry", onClick: () => handleAddProduct(e) },
        })
      }
    } catch (error) {
      console.error("Add product error:", error)
      toast("Add Product Failed", {
        description: "Network error occurred. Please check your connection and try again.",
        action: { label: "Retry", onClick: () => handleAddProduct(e) },
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

              {/* Header */}
              <div className="flex items-center gap-3 px-4 lg:px-6">
                <Link href="/products">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold">Add New Product</h1>
              </div>

              {/* Form */}
              <div className="px-4 lg:px-6">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                      <Package className="w-5 h-5 text-primary" />
                      Product Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddProduct} className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Product Name</Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="Enter product name"
                              value={newProduct.name}
                              onChange={handleInputChange}
                              className="h-10 border-border/50 focus:border-primary/50"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="basePrice" className="text-sm font-medium">Base Price (LKR)</Label>
                            <Input
                              id="basePrice"
                              name="basePrice"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={newProduct.basePrice}
                              onChange={handleInputChange}
                              className="h-10 border-border/50 focus:border-primary/50"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                            <Select value={newProduct.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                              <SelectTrigger className="h-10 border-border/50 focus:border-primary/50">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                          <Input
                            id="description"
                            name="description"
                            placeholder="Enter product description"
                            value={newProduct.description}
                            onChange={handleInputChange}
                            className="border-border/50 focus:border-primary/50"
                            required
                          />
                        </div>
                      </div>

                      {/* Product Images */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Product Images
                        </h3>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Upload Images</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              disabled={uploadingImage}
                              onChange={async (e) => {
                                const files = e.target.files
                                if (!files || files.length === 0) return
                                setUploadingImage(true)
                                try {
                                  const uploadedUrls: string[] = []
                                  for (const file of Array.from(files)) {
                                    const formData = new FormData()
                                    formData.append("file", file)
                                    const res = await fetch("/api/upload", { method: "POST", body: formData })
                                    const result = await res.json()
                                    if (result.success && result.url) uploadedUrls.push(result.url)
                                  }
                                  if (uploadedUrls.length > 0) {
                                    setNewProduct((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...uploadedUrls] }))
                                    toast("Image Uploaded Successfully", {
                                      description: `${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} added to product`,
                                    })
                                  }
                                } catch {
                                  toast("Upload Error", { description: "Failed to upload image. Please try again." })
                                } finally {
                                  setUploadingImage(false)
                                  e.target.value = ""
                                }
                              }}
                              className="hidden"
                              id="product-image-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              disabled={uploadingImage}
                              onClick={() => document.getElementById("product-image-upload")?.click()}
                              className="flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              {uploadingImage ? "Uploading..." : "Upload Images"}
                            </Button>
                          </div>
                        </div>
                        {newProduct.imageUrls.length > 0 && (
                          <div className="mt-4">
                            <Label className="text-sm font-medium">Image Preview</Label>
                            <div className="mt-2 flex flex-wrap gap-3">
                              {newProduct.imageUrls.map((url, idx) => (
                                <div key={idx} className="relative group">
                                  <div className="w-24 h-24 border-2 border-border/50 rounded-lg overflow-hidden bg-muted/30">
                                    <img src={url} alt={`Product preview ${idx + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setNewProduct(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) }))}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                    aria-label="Remove image"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Colors */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Product Colors
                        </h3>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Select Colors</Label>
                            <Select onValueChange={handleColorSelect}>
                              <SelectTrigger className="h-10 border-border/50 focus:border-primary/50">
                                <SelectValue placeholder="Choose colors to add" />
                              </SelectTrigger>
                              <SelectContent>
                                {colors
                                  .filter(color => !newProduct.colors.some(c => c.colorId === color.id))
                                  .map((color) => (
                                    <SelectItem key={color.id} value={color.id}>{color.label}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {newProduct.colors.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Selected Colors</Label>
                              <div className="flex flex-wrap gap-2">
                                {getSelectedColorNames().map((colorName, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                                  >
                                    <span className="text-sm">{colorName}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeSelectedColor(newProduct.colors[index].colorId)}
                                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                      aria-label={`Remove ${colorName} color`}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {newProduct.colors.length === 0 && (
                            <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
                              <Palette className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                              No colors selected. Choose colors from the dropdown above.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Sizes & Stock */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Product Sizes &amp; Stock
                        </h3>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Select Size</Label>
                            <div className="flex gap-2">
                              <Select onValueChange={(value) => {
                                if (newProduct.sizes.some(s => s.sizeId === value)) return
                                setNewProduct({ ...newProduct, sizes: [...newProduct.sizes, { sizeId: value, stockQuantity: "" }] })
                              }}>
                                <SelectTrigger className="h-10 border-border/50 focus:border-primary/50">
                                  <SelectValue placeholder="Choose size to add" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizes
                                    .filter(size => !newProduct.sizes.some(s => s.sizeId === size.id))
                                    .map((size) => (
                                      <SelectItem key={size.id} value={size.id}>{size.label}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {newProduct.sizes.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Size Configuration</Label>
                              <div className="flex flex-wrap gap-2">
                                {newProduct.sizes.map((size, index) => {
                                  const sizeData = sizes.find(s => s.id === size.sizeId)
                                  return (
                                    <div key={index} className="relative group">
                                      <Badge
                                        variant="secondary"
                                        className="flex items-center gap-4 px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors min-w-[200px]"
                                      >
                                        <span className="text-sm font-medium flex-1 text-left">{sizeData?.label || "Unknown"}</span>
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-muted-foreground">Qty:</span>
                                          <input
                                            type="number"
                                            placeholder="0"
                                            value={size.stockQuantity}
                                            onChange={(e) => handleSizeChange(index, "stockQuantity", e.target.value)}
                                            className="w-12 h-6 text-xs text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/50 rounded px-1"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => removeSize(index)}
                                          className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                                          aria-label={`Remove ${sizeData?.label || "size"}`}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </Badge>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          {newProduct.sizes.length === 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
                              <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                              No sizes added. Choose sizes from the dropdown above.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/50 flex gap-3">
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                        </Button>
                        <Link href="/products">
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </Link>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
