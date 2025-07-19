"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { DollarSign, Edit, Hash, ImageIcon, Package, Ruler, Tag } from "lucide-react"

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

interface ProductsTableProps {
  products: Product[]
  categories: { id: string; label: string }[]
  sizes: { id: string; label: string }[]
  onProductUpdate: () => void
}

export function ProductsTable({ products, categories, sizes, onProductUpdate }: ProductsTableProps) {
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState<{
    name: string
    description: string
    basePrice: string
    imageUrls: string[]
    categoryId: string
    sizes: Array<{
      sizeId: string
      stockQuantity: string
      price: string
    }>
  }>({
    name: "",
    description: "",
    basePrice: "",
    imageUrls: [],
    categoryId: "",
    sizes: [],
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString(),
      imageUrls: product.imageUrls,
      categoryId: product.categoryId.toString(),
      sizes: product.sizes.map(size => ({
        sizeId: size.sizeId.toString(),
        stockQuantity: size.stockQuantity.toString(),
        price: size.price.toString(),
      })),
    })
    setIsEditDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setEditForm({ ...editForm, [name]: value })
  }

  const handleSizeChange = (index: number, field: string, value: string) => {
    const updatedSizes = [...editForm.sizes]
    updatedSizes[index] = { ...updatedSizes[index], [field]: value }
    setEditForm({ ...editForm, sizes: updatedSizes })
  }

  const addSize = () => {
    setEditForm({
      ...editForm,
      sizes: [...editForm.sizes, { sizeId: "", stockQuantity: "", price: "" }]
    })
  }

  const removeSize = (index: number) => {
    const updatedSizes = editForm.sizes.filter((_, i) => i !== index)
    setEditForm({ ...editForm, sizes: updatedSizes })
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const response = await fetch("/api/product", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editForm.name,
          description: editForm.description,
          basePrice: parseFloat(editForm.basePrice),
          imageUrls: editForm.imageUrls,
          category: parseInt(editForm.categoryId),
          sizes: editForm.sizes.map(size => ({
            sizeId: parseInt(size.sizeId),
            stockQuantity: parseInt(size.stockQuantity),
            price: parseFloat(size.price),
          })),
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast("Product Updated Successfully", {
          description: `${editForm.name} has been updated in your inventory`,
          action: {
            label: "View Changes",
            onClick: () => {
              console.log("Product updated:", editingProduct.id)
            },
          },
        })
        setIsEditDialogOpen(false)
        setEditingProduct(null)
        onProductUpdate()
      } else {
        toast("Failed to Update Product", {
          description: result.error || "An error occurred while updating the product",
          action: {
            label: "Retry",
            onClick: () => handleUpdateProduct(e),
          },
        })
      }
    } catch {
      toast("Update Product Failed", {
        description: "Network error occurred. Please check your connection and try again.",
        action: {
          label: "Retry",
          onClick: () => handleUpdateProduct(e),
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your product inventory and details
        </p>
      </div>

      {/* Products Table Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Product Inventory</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Desktop View */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Images</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Product</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Base Price</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Total Stock</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Sizes</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Category</TableHead>
                    <TableHead className="text-right font-medium text-xs uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex -space-x-2">
                          {product.imageUrls.slice(0, 3).map((url, idx) => (
                            <div
                              key={idx}
                              className="relative w-10 h-10 rounded-full border-2 border-background overflow-hidden shadow-sm"
                            >
                              <img
                                src={url}
                                alt={`${product.name} ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {product.imageUrls.length > 3 && (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                              +{product.imageUrls.length - 3}
                            </div>
                          )}
                          {product.imageUrls.length === 0 && (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/50">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-sm leading-none">{product.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">${product.basePrice.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={product.totalStock > 10 ? "default" : product.totalStock > 0 ? "secondary" : "destructive"}
                          className="text-xs font-medium"
                        >
                          {product.totalStock} units
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map((size, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {size.sizeName} ({size.stockQuantity})
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="text-xs">
                          {product.categoryName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit product</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile/Tablet View */}
            <div className="lg:hidden space-y-4 p-4">
              {products.map((product) => (
                <Card key={product.id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {product.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="h-8 w-8 p-0 ml-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Images */}
                    {product.imageUrls.length > 0 && (
                      <div className="flex -space-x-1 mb-3">
                        {product.imageUrls.slice(0, 4).map((url, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-background overflow-hidden shadow-sm"
                          >
                            <img
                              src={url}
                              alt={`${product.name} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {product.imageUrls.length > 4 && (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                            +{product.imageUrls.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">${product.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <Badge 
                          variant={product.totalStock > 10 ? "default" : product.totalStock > 0 ? "secondary" : "destructive"}
                          className="text-xs h-5"
                        >
                          {product.totalStock}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs h-5">
                          {product.categoryName}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-3 w-3 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.slice(0, 2).map((size, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs h-5">
                              {size.sizeName}
                            </Badge>
                          ))}
                          {product.sizes.length > 2 && (
                            <Badge variant="outline" className="text-xs h-5">
                              +{product.sizes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent className="w-full sm:max-w-2xl pl-6">
          <SheetHeader className="pb-6">
            <SheetTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Product
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-120px)] pr-4">
            <form onSubmit={handleUpdateProduct} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Product Information</h3>
                </div>
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-xs font-medium">Product Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      placeholder="Enter product name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-basePrice" className="text-xs font-medium">Base Price ($)</Label>
                    <Input
                      id="edit-basePrice"
                      name="basePrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editForm.basePrice}
                      onChange={handleInputChange}
                      required
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-xs font-medium">Description</Label>
                  <Input
                    id="edit-description"
                    name="description"
                    placeholder="Enter product description"
                    value={editForm.description}
                    onChange={handleInputChange}
                    required
                    className="h-9"
                  />
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Classification</h3>
                </div>
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category" className="text-xs font-medium">Category</Label>
                    <Select value={editForm.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat, idx) => (
                          <SelectItem key={cat.id} value={(idx + 1).toString()}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sizes and Stock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Sizes & Stock</h3>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addSize}>
                    Add Size
                  </Button>
                </div>
                <Separator />
                
                <div className="space-y-3">
                  {editForm.sizes.map((size, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3 p-3 border rounded-lg">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Size</Label>
                        <Select 
                          value={size.sizeId} 
                          onValueChange={(value) => handleSizeChange(index, "sizeId", value)}
                        >
                          <SelectTrigger className="h-8">
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
                          className="h-8"
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
                            className="h-8"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSize(index)}
                            className="h-8 w-8 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {editForm.sizes.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No sizes added. Click "Add Size" to add product sizes.
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Product
                </Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}