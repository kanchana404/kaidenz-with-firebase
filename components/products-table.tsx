"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UploadButton } from "@/utils/uploadthing"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Edit, X, Package, DollarSign, Hash, Tag, Ruler, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  description: string
  price: number
  qty: number
  categoryId: number
  categoryName: string
  sizeId: number
  sizeName: string
  imageUrls: string[]
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
    price: string
    qty: string
    imageUrls: string[]
    categoryId: string
    sizeId: string
  }>({
    name: "",
    description: "",
    price: "",
    qty: "",
    imageUrls: [],
    categoryId: "",
    sizeId: "",
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      qty: product.qty.toString(),
      imageUrls: product.imageUrls,
      categoryId: product.categoryId.toString(),
      sizeId: product.sizeId.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setEditForm({ ...editForm, [name]: value })
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
          price: parseFloat(editForm.price),
          qty: parseInt(editForm.qty),
          imageUrls: editForm.imageUrls,
          category: parseInt(editForm.categoryId),
          size: parseInt(editForm.sizeId),
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast("Product Updated Successfully", {
          description: `${editForm.name} has been updated in your inventory`,
          action: {
            label: "View Changes",
            onClick: () => {
              // Could scroll to the updated product row
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
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Price</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Stock</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Category</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Size</TableHead>
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
                          <span className="font-medium">{product.price.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={product.qty > 10 ? "default" : product.qty > 0 ? "secondary" : "destructive"}
                          className="text-xs font-medium"
                        >
                          {product.qty} units
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="text-xs">
                          {product.categoryName}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="text-xs">
                          {product.sizeName}
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
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <Badge 
                          variant={product.qty > 10 ? "default" : product.qty > 0 ? "secondary" : "destructive"}
                          className="text-xs h-5"
                        >
                          {product.qty}
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
                        <Badge variant="outline" className="text-xs h-5">
                          {product.sizeName}
                        </Badge>
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
                    <Label htmlFor="edit-price" className="text-xs font-medium">Price ($)</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editForm.price}
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

              {/* Inventory & Classification */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Classification</h3>
                </div>
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-qty" className="text-xs font-medium">Stock Quantity</Label>
                    <Input
                      id="edit-qty"
                      name="qty"
                      type="number"
                      placeholder="0"
                      value={editForm.qty}
                      onChange={handleInputChange}
                      required
                      className="h-9"
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-size" className="text-xs font-medium">Size</Label>
                    <Select value={editForm.sizeId} onValueChange={(value) => handleSelectChange("sizeId", value)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size, idx) => (
                          <SelectItem key={size.id} value={(idx + 1).toString()}>{size.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Product Images</h3>
                </div>
                <Separator />
                
                <div className="space-y-4">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]?.url) {
                        setEditForm((prev) => ({
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

                  {editForm.imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Current Images</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {editForm.imageUrls.map((url, idx) => (
                          <div key={idx} className="relative group aspect-square border rounded-lg overflow-hidden bg-muted">
                            <img
                              src={url}
                              alt={`Product image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setEditForm(prev => ({
                                  ...prev,
                                  imageUrls: prev.imageUrls.filter((_, i) => i !== idx)
                                }))
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button type="submit" className="flex-1 h-9">
                  Update Product
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 h-9"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}