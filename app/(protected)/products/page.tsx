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
import { ProductsTable } from "@/components/products-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { X, Plus, Image as ImageIcon, Package, Palette } from "lucide-react"
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

interface ProductColor {
  colorId: number
  colorName: string
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
  colors: ProductColor[]
}

export default function ProductsPage() {
  const [search, setSearch] = React.useState("")
  const [products, setProducts] = React.useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<{ id: string; label: string; imageUrl: string }[]>([])
  const [sizes, setSizes] = React.useState<{ id: string; label: string }[]>([])
  const [colors, setColors] = React.useState<{ id: string; label: string; hexCode: string }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // New state for category, size, and color management
  const [newCategory, setNewCategory] = React.useState("")
  const [categoryImageFile, setCategoryImageFile] = React.useState<File | null>(null)
  const [categoryImagePreview, setCategoryImagePreview] = React.useState<string | null>(null)
  const [uploadingCategoryImage, setUploadingCategoryImage] = React.useState(false)
  const [newSize, setNewSize] = React.useState("")
  const [newColor, setNewColor] = React.useState("")
  const [selectedColorHex, setSelectedColorHex] = React.useState("")
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false)
  const [addingCategory, setAddingCategory] = React.useState(false)
  const [addingSize, setAddingSize] = React.useState(false)
  const [addingColor, setAddingColor] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("products")
  const [editingCategory, setEditingCategory] = React.useState<{ id: string; name: string } | null>(null)
  const [editingSize, setEditingSize] = React.useState<{ id: string; name: string } | null>(null)
  const [editingColor, setEditingColor] = React.useState<{ id: string; name: string; hexCode: string } | null>(null)
  const [deletingCategory, setDeletingCategory] = React.useState<string | null>(null)
  const [deletingSize, setDeletingSize] = React.useState<string | null>(null)
  const [deletingColor, setDeletingColor] = React.useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<{ type: 'category' | 'size' | 'color'; id: string; name: string } | null>(null)
  
  const [newProduct, setNewProduct] = React.useState<{
    name: string;
    description: string;
    basePrice: string;
    imageUrls: string[];
    categoryId: string;
    sizes: Array<{
      sizeId: string;
      stockQuantity: string;
    }>;
    colors: Array<{
      colorId: string;
    }>;
  }>({
    name: "",
    description: "",
    basePrice: "",
    imageUrls: [],
    categoryId: "",
    sizes: [],
    colors: [],
  })

  const fetchColors = React.useCallback(async () => {
    try {
      const response = await fetch("/api/colors")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setColors(result.colors.map((color: any) => ({
            id: color.id.toString(),
            label: color.name,
            hexCode: color.hexCode || ""
          })))
        }
      }
    } catch (error) {
      console.error("Error fetching colors:", error)
    }
  }, [])

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
          const data: Array<{ id: string; name: string; imageUrl: string }> = result.categories
          setCategories(data.map((item) => ({
            id: item.id,
            label: item.name,
            imageUrl: item.imageUrl || "",
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
      let imageUrl = ""

      // Upload image if selected
      if (categoryImageFile) {
        setUploadingCategoryImage(true)
        const uploadFormData = new FormData()
        uploadFormData.append("file", categoryImageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })
        const uploadResult = await uploadResponse.json()
        setUploadingCategoryImage(false)

        if (uploadResult.success) {
          imageUrl = uploadResult.url
        } else {
          toast("Image Upload Failed", {
            description: "Failed to upload category image",
          })
          setAddingCategory(false)
          return
        }
      }

      const formData = new FormData()
      formData.append("name", newCategory.trim())
      formData.append("imageUrl", imageUrl)

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
        setCategoryImageFile(null)
        setCategoryImagePreview(null)
        fetchCategories()
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
      setUploadingCategoryImage(false)
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

  const COLOR_PALETTE: { group: string; colors: { name: string; hex: string }[] }[] = [
    { group: "Red", colors: [
      { name: "Light Red", hex: "#fca5a5" }, { name: "Coral Red", hex: "#f87171" }, { name: "True Red", hex: "#ef4444" },
      { name: "Bold Red", hex: "#dc2626" }, { name: "Dark Red", hex: "#b91c1c" }, { name: "Deep Burgundy", hex: "#7f1d1d" },
    ]},
    { group: "Rose", colors: [
      { name: "Soft Rose", hex: "#fda4af" }, { name: "Rose Pink", hex: "#fb7185" }, { name: "Hot Rose", hex: "#f43f5e" },
      { name: "Deep Rose", hex: "#e11d48" }, { name: "Wine Rose", hex: "#9f1239" },
    ]},
    { group: "Pink", colors: [
      { name: "Baby Pink", hex: "#fbcfe8" }, { name: "Light Pink", hex: "#f9a8d4" }, { name: "Bubblegum Pink", hex: "#f472b6" },
      { name: "Hot Pink", hex: "#ec4899" }, { name: "Fuchsia Pink", hex: "#db2777" }, { name: "Dark Magenta", hex: "#9d174d" },
    ]},
    { group: "Orange", colors: [
      { name: "Peach", hex: "#fdba74" }, { name: "Light Orange", hex: "#fb923c" }, { name: "True Orange", hex: "#f97316" },
      { name: "Burnt Orange", hex: "#ea580c" }, { name: "Rust", hex: "#c2410c" }, { name: "Deep Rust", hex: "#9a3412" },
    ]},
    { group: "Amber", colors: [
      { name: "Golden Yellow", hex: "#fcd34d" }, { name: "Amber Gold", hex: "#fbbf24" }, { name: "True Amber", hex: "#f59e0b" },
      { name: "Dark Amber", hex: "#d97706" }, { name: "Caramel", hex: "#b45309" }, { name: "Bronze", hex: "#92400e" },
    ]},
    { group: "Yellow", colors: [
      { name: "Soft Yellow", hex: "#fef08a" }, { name: "Lemon Yellow", hex: "#fde047" }, { name: "Bright Yellow", hex: "#facc15" },
      { name: "Mustard Yellow", hex: "#eab308" }, { name: "Dark Mustard", hex: "#ca8a04" },
    ]},
    { group: "Lime", colors: [
      { name: "Pale Lime", hex: "#d9f99d" }, { name: "Light Lime", hex: "#bef264" }, { name: "Lime Green", hex: "#84cc16" },
      { name: "Olive Lime", hex: "#65a30d" }, { name: "Deep Olive", hex: "#4d7c0f" },
    ]},
    { group: "Green", colors: [
      { name: "Mint Green", hex: "#86efac" }, { name: "Light Green", hex: "#4ade80" }, { name: "True Green", hex: "#22c55e" },
      { name: "Forest Green", hex: "#16a34a" }, { name: "Dark Green", hex: "#15803d" }, { name: "Deep Forest", hex: "#14532d" },
    ]},
    { group: "Emerald", colors: [
      { name: "Light Emerald", hex: "#6ee7b7" }, { name: "Emerald", hex: "#34d399" }, { name: "True Emerald", hex: "#10b981" },
      { name: "Deep Emerald", hex: "#059669" }, { name: "Dark Emerald", hex: "#047857" },
    ]},
    { group: "Teal", colors: [
      { name: "Light Teal", hex: "#5eead4" }, { name: "Teal", hex: "#2dd4bf" }, { name: "True Teal", hex: "#14b8a6" },
      { name: "Deep Teal", hex: "#0d9488" }, { name: "Dark Teal", hex: "#0f766e" },
    ]},
    { group: "Cyan", colors: [
      { name: "Light Cyan", hex: "#67e8f9" }, { name: "Cyan", hex: "#22d3ee" }, { name: "True Cyan", hex: "#06b6d4" },
      { name: "Deep Cyan", hex: "#0891b2" }, { name: "Dark Cyan", hex: "#0e7490" },
    ]},
    { group: "Sky Blue", colors: [
      { name: "Powder Blue", hex: "#bae6fd" }, { name: "Light Sky", hex: "#7dd3fc" }, { name: "Sky Blue", hex: "#38bdf8" },
      { name: "Bright Sky", hex: "#0ea5e9" }, { name: "Deep Sky", hex: "#0284c7" },
    ]},
    { group: "Blue", colors: [
      { name: "Baby Blue", hex: "#93c5fd" }, { name: "Light Blue", hex: "#60a5fa" }, { name: "True Blue", hex: "#3b82f6" },
      { name: "Royal Blue", hex: "#2563eb" }, { name: "Deep Blue", hex: "#1d4ed8" }, { name: "Navy Blue", hex: "#1e40af" }, { name: "Dark Navy", hex: "#1e3a8a" },
    ]},
    { group: "Indigo", colors: [
      { name: "Light Indigo", hex: "#a5b4fc" }, { name: "Soft Indigo", hex: "#818cf8" }, { name: "True Indigo", hex: "#6366f1" },
      { name: "Deep Indigo", hex: "#4f46e5" }, { name: "Dark Indigo", hex: "#4338ca" }, { name: "Midnight Indigo", hex: "#312e81" },
    ]},
    { group: "Violet", colors: [
      { name: "Lavender", hex: "#c4b5fd" }, { name: "Soft Violet", hex: "#a78bfa" }, { name: "True Violet", hex: "#8b5cf6" },
      { name: "Deep Violet", hex: "#7c3aed" }, { name: "Dark Violet", hex: "#6d28d9" }, { name: "Eggplant", hex: "#4c1d95" },
    ]},
    { group: "Purple", colors: [
      { name: "Lilac", hex: "#d8b4fe" }, { name: "Soft Purple", hex: "#c084fc" }, { name: "True Purple", hex: "#a855f7" },
      { name: "Deep Purple", hex: "#9333ea" }, { name: "Royal Purple", hex: "#7e22ce" }, { name: "Dark Plum", hex: "#581c87" },
    ]},
    { group: "Fuchsia", colors: [
      { name: "Light Fuchsia", hex: "#f0abfc" }, { name: "Soft Fuchsia", hex: "#e879f9" }, { name: "True Fuchsia", hex: "#d946ef" },
      { name: "Deep Fuchsia", hex: "#c026d3" }, { name: "Dark Fuchsia", hex: "#a21caf" },
    ]},
    { group: "Neutral", colors: [
      { name: "Off White", hex: "#f5f5f5" }, { name: "Light Gray", hex: "#e5e5e5" }, { name: "Silver", hex: "#d4d4d4" },
      { name: "Medium Gray", hex: "#a3a3a3" }, { name: "Charcoal Gray", hex: "#737373" }, { name: "Dark Gray", hex: "#525252" },
      { name: "Deep Charcoal", hex: "#404040" }, { name: "Near Black", hex: "#262626" }, { name: "Jet Black", hex: "#171717" },
    ]},
    { group: "Stone / Beige", colors: [
      { name: "Cream", hex: "#f5f5f4" }, { name: "Light Beige", hex: "#e7e5e4" }, { name: "Beige", hex: "#d6d3d1" },
      { name: "Taupe", hex: "#a8a29e" }, { name: "Stone Gray", hex: "#78716c" }, { name: "Dark Taupe", hex: "#57534e" },
      { name: "Espresso", hex: "#44403c" }, { name: "Dark Brown", hex: "#292524" },
    ]},
  ]

  const handleAddColor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newColor.trim() || !selectedColorHex) {
      toast("Validation Error", {
        description: "Please select a color from the palette",
      })
      return
    }

    setAddingColor(true)
    try {
      const response = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newColor.trim(), hexCode: selectedColorHex }),
      })

      const result = await response.json()

      if (result.success) {
        toast("Color Added Successfully", {
          description: `"${newColor}" has been added to colors`,
        })
        setNewColor("")
        setSelectedColorHex("")
        setColorPickerOpen(false)
        fetchColors()
      } else {
        toast("Failed to Add Color", {
          description: result.error || "An error occurred while adding the color",
        })
      }
    } catch {
      toast("Add Color Failed", {
        description: "Network error occurred. Please check your connection and try again.",
      })
    } finally {
      setAddingColor(false)
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

  const handleUpdateColor = async (id: string, name: string, hexCode?: string) => {
    try {
      const response = await fetch("/api/colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, hexCode: hexCode || "" }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast("Color Updated Successfully", {
          description: `Color has been updated to "${name}"`,
        })
        setEditingColor(null)
        fetchColors() // Refresh the colors list
      } else {
        toast("Failed to Update Color", {
          description: result.error || "An error occurred while updating the color",
        })
      }
    } catch {
      toast("Update Color Failed", {
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

  const handleDeleteColor = (id: string, name: string) => {
    setDeleteTarget({ type: 'color', id, name })
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
    } else if (deleteTarget.type === 'color') {
      setDeletingColor(deleteTarget.id)
      try {
        const response = await fetch(`/api/colors?id=${deleteTarget.id}`, {
          method: "DELETE",
        })

        const result = await response.json()
        
        if (result.success) {
          toast("Color Deleted Successfully", {
            description: `"${deleteTarget.name}" has been deleted from colors`,
          })
          fetchColors() // Refresh the colors list
        } else {
          toast("Failed to Delete Color", {
            description: result.error || "An error occurred while deleting the color",
          })
        }
      } catch {
        toast("Delete Color Failed", {
          description: "Network error occurred. Please check your connection and try again.",
        })
      } finally {
        setDeletingColor(null)
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

    // Fetch colors
    fetchColors()

    // Fetch products
    fetchProducts()
  }, [fetchProducts, fetchCategories, fetchSizes, fetchColors])



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
      sizes: [...newProduct.sizes, { sizeId: "", stockQuantity: "" }]
    })
  }

  const removeSize = (index: number) => {
    const updatedSizes = newProduct.sizes.filter((_, i) => i !== index)
    setNewProduct({ ...newProduct, sizes: updatedSizes })
  }

  const handleColorSelect = (colorId: string) => {
    const color = colors.find(c => c.id === colorId)
    if (!color) return
    
    // Check if color is already selected
    const isAlreadySelected = newProduct.colors.some(c => c.colorId === colorId)
    if (isAlreadySelected) return
    
    setNewProduct({
      ...newProduct,
      colors: [...newProduct.colors, { colorId }]
    })
  }

  const removeSelectedColor = (colorId: string) => {
    setNewProduct({
      ...newProduct,
      colors: newProduct.colors.filter(c => c.colorId !== colorId)
    })
  }

  const getSelectedColorNames = () => {
    return newProduct.colors.map(color => {
      const colorData = colors.find(c => c.id === color.colorId)
      return colorData?.label || 'Unknown'
    })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Comprehensive validation
    const validationErrors = []
    
    if (!newProduct.name.trim()) {
      validationErrors.push("Product name is required")
    }
    
    if (!newProduct.description.trim()) {
      validationErrors.push("Product description is required")
    }
    
    if (!newProduct.basePrice || parseFloat(newProduct.basePrice) <= 0) {
      validationErrors.push("Valid base price is required")
    }
    
    if (!newProduct.categoryId) {
      validationErrors.push("Product category is required")
    }
    
    if (newProduct.sizes.length === 0) {
      validationErrors.push("At least one size is required")
    } else {
      // Validate each size
      newProduct.sizes.forEach((size, index) => {
        if (!size.sizeId) {
          validationErrors.push(`Size ${index + 1}: Size selection is required`)
        }
        if (!size.stockQuantity || parseInt(size.stockQuantity) < 0) {
          validationErrors.push(`Size ${index + 1}: Valid stock quantity is required`)
        }
      })
    }
    
    if (newProduct.imageUrls.length === 0) {
      validationErrors.push("At least one product image is required")
    }
    
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
        colors: newProduct.colors.map(color => ({
          colorId: color.colorId,
        })),
      }
      
      console.log("Sending product data:", requestBody)
      
      const response = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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
          colors: [],
        })
        fetchProducts()
      } else {
        // Handle specific backend errors
        let errorMessage = result.error || "An error occurred while adding the product"
        
        // Parse common backend errors
        if (errorMessage.includes("JsonNull")) {
          errorMessage = "Missing required data. Please check all fields are filled correctly."
        } else if (errorMessage.includes("category")) {
          errorMessage = "Category is required. Please select a valid category."
        } else if (errorMessage.includes("size")) {
          errorMessage = "Size configuration is invalid. Please check size, stock, and price values."
        } else if (errorMessage.includes("color")) {
          errorMessage = "Color selection is invalid. Please check color values."
        } else if (errorMessage.includes("image")) {
          errorMessage = "Image upload failed. Please try uploading images again."
        } else if (errorMessage.includes("500")) {
          errorMessage = "Server error. Please try again or contact support if the issue persists."
        }
        
        toast("Failed to Add Product", {
          description: errorMessage,
          action: {
            label: "Retry",
            onClick: () => handleAddProduct(e),
          },
        })
      }
    } catch (error) {
      console.error("Add product error:", error)
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
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 bg-background border border-border shadow-sm">
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
                    <TabsTrigger 
                      value="colors" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                      Colors
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Products Tab */}
                  <TabsContent value="products" className="space-y-6 mt-6">
                    {/* Add Product Form */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                      <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                          <Package className="w-5 h-5 text-primary" />
                          Add New Product
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
                                        const res = await fetch("/api/upload", {
                                          method: "POST",
                                          body: formData,
                                        })
                                        const result = await res.json()
                                        if (result.success && result.url) {
                                          uploadedUrls.push(result.url)
                                        }
                                      }
                                      if (uploadedUrls.length > 0) {
                                        setNewProduct((prev) => ({
                                          ...prev,
                                          imageUrls: [...prev.imageUrls, ...uploadedUrls]
                                        }))
                                        toast("Image Uploaded Successfully", {
                                          description: `${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} added to product`,
                                        })
                                      }
                                    } catch (error) {
                                      toast("Upload Error", {
                                        description: "Failed to upload image. Please try again.",
                                      })
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
                                        <img
                                          src={url}
                                          alt={`Product preview ${idx + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNewProduct(prev => ({
                                            ...prev,
                                            imageUrls: prev.imageUrls.filter((_, i) => i !== idx)
                                          }))
                                        }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        aria-label="Remove image"
                                        title="Remove image"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Product Colors - Modern Design */}
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
                                        <SelectItem key={color.id} value={color.id}>
                                          {color.label}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Selected Colors as Badges */}
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
                                          title={`Remove ${colorName} color`}
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

                          {/* Product Sizes - Badge Style */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Product Sizes & Stock
                            </h3>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Select Size</Label>
                                <div className="flex gap-2">
                                  <Select onValueChange={(value) => {
                                    const size = sizes.find(s => s.id === value)
                                    if (!size) return
                                    
                                    // Check if size is already selected
                                    const isAlreadySelected = newProduct.sizes.some(s => s.sizeId === value)
                                    if (isAlreadySelected) return
                                    
                                    setNewProduct({
                                      ...newProduct,
                                      sizes: [...newProduct.sizes, { sizeId: value, stockQuantity: "" }]
                                    })
                                  }}>
                                    <SelectTrigger className="h-10 border-border/50 focus:border-primary/50">
                                      <SelectValue placeholder="Choose size to add" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {sizes
                                        .filter(size => !newProduct.sizes.some(s => s.sizeId === size.id))
                                        .map((size) => (
                                          <SelectItem key={size.id} value={size.id}>
                                            {size.label}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addSize}
                                    className="h-10 px-3 border-border/50 hover:border-primary/50"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Size
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Selected Sizes as Badges */}
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
                                            {/* Size Name - Left Aligned */}
                                            <span className="text-sm font-medium flex-1 text-left">
                                              {sizeData?.label || 'Unknown'}
                                            </span>
                                            
                                            {/* Stock Quantity */}
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
                                            
                                            {/* Remove Button */}
                                            <button
                                              type="button"
                                              onClick={() => removeSize(index)}
                                              className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                                              aria-label={`Remove ${sizeData?.label || 'size'}`}
                                              title={`Remove ${sizeData?.label || 'size'}`}
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
                                  No sizes added. Choose sizes from the dropdown above or click &quot;Add Size&quot;.
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-border/50">
                            <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Product
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Products Table */}
                    {loading && (
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="overflow-hidden rounded-lg border">
                          <div className="p-4">
                            <div className="space-y-3">
                              {/* Table header skeleton */}
                              <div className="flex gap-4 pb-4 border-b">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                              </div>
                              {/* Table rows skeleton */}
                              {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="flex gap-4 py-3">
                                  <Skeleton className="h-4 w-20" />
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-4 w-20" />
                                  <Skeleton className="h-6 w-16 rounded-full" />
                                  <Skeleton className="h-4 w-20" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="text-center py-12">
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
                        colors={colors}
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
                          <form onSubmit={handleAddCategory} className="space-y-3">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Input
                                  placeholder="Enter new category name"
                                  value={newCategory}
                                  onChange={(e) => setNewCategory(e.target.value)}
                                  disabled={addingCategory}
                                />
                              </div>
                              <Button type="submit" disabled={addingCategory || !newCategory.trim()}>
                                {addingCategory ? (uploadingCategoryImage ? "Uploading..." : "Adding...") : "Add Category"}
                              </Button>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="category-image-input"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      setCategoryImageFile(file)
                                      setCategoryImagePreview(URL.createObjectURL(file))
                                    }
                                  }}
                                  disabled={addingCategory}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById("category-image-input")?.click()}
                                  disabled={addingCategory}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {categoryImageFile ? "Change Image" : "Upload Image"}
                                </Button>
                                {categoryImageFile && (
                                  <span className="text-sm text-muted-foreground">{categoryImageFile.name}</span>
                                )}
                              </div>
                              {categoryImagePreview && (
                                <div className="relative">
                                  <img
                                    src={categoryImagePreview}
                                    alt="Preview"
                                    className="h-12 w-12 rounded object-cover border"
                                  />
                                  <button
                                    type="button"
                                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center text-xs"
                                    onClick={() => {
                                      setCategoryImageFile(null)
                                      setCategoryImagePreview(null)
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
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
                                      <div className="flex items-center gap-3">
                                        {category.imageUrl ? (
                                          <img src={category.imageUrl} alt={category.label} className="h-10 w-10 rounded object-cover border" />
                                        ) : (
                                          <div className="h-10 w-10 rounded border border-dashed flex items-center justify-center">
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                        )}
                                        <span className="font-medium">{index + 1}. {category.label}</span>
                                      </div>
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

                  {/* Colors Tab */}
                  <TabsContent value="colors" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Manage Colors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Add Color - Palette Picker */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              {selectedColorHex && (
                                <div
                                  className="w-8 h-8 rounded-md border-2 border-white shadow-sm shrink-0"
                                  style={{ backgroundColor: selectedColorHex }}
                                />
                              )}
                              <div className="flex-1 text-sm font-medium">
                                {selectedColorHex ? `${newColor} (${selectedColorHex})` : "Select a color from the palette below"}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                              >
                                {colorPickerOpen ? "Close Palette" : "Open Palette"}
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleAddColor}
                                disabled={addingColor || !selectedColorHex}
                              >
                                {addingColor ? "Adding..." : "Add Color"}
                              </Button>
                            </div>

                            {colorPickerOpen && (
                              <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-3 bg-background">
                                {COLOR_PALETTE.map((group) => (
                                  <div key={group.group}>
                                    <Label className="text-xs text-muted-foreground mb-1 block">{group.group}</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                      {group.colors.map((c) => (
                                        <button
                                          key={c.hex}
                                          type="button"
                                          title={`${c.name} (${c.hex})`}
                                          className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
                                            selectedColorHex === c.hex ? "border-white ring-2 ring-primary scale-110" : "border-transparent"
                                          }`}
                                          style={{ backgroundColor: c.hex }}
                                          onClick={() => {
                                            setSelectedColorHex(c.hex)
                                            setNewColor(c.name)
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Colors List */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Existing Colors ({colors.length})</Label>
                            <div className="space-y-2">
                              {colors.map((color, index) => (
                                <div key={color.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                  {editingColor?.id === color.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                      <div
                                        className="w-6 h-6 rounded border shrink-0"
                                        style={{ backgroundColor: editingColor.hexCode || "#888" }}
                                      />
                                      <Input
                                        value={editingColor.name}
                                        onChange={(e) => setEditingColor({ ...editingColor, name: e.target.value })}
                                        className="flex-1"
                                        autoFocus
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateColor(color.id, editingColor.name, editingColor.hexCode)}
                                        disabled={!editingColor.name.trim()}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingColor(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-6 h-6 rounded border shrink-0"
                                          style={{ backgroundColor: color.hexCode || "#888" }}
                                        />
                                        <span className="font-medium">{index + 1}. {color.label}</span>
                                        <span className="text-xs text-muted-foreground">{color.hexCode}</span>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingColor({ id: color.id, name: color.label, hexCode: color.hexCode })}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDeleteColor(color.id, color.label)}
                                          disabled={deletingColor === color.id}
                                        >
                                          {deletingColor === color.id ? "Deleting..." : "Delete"}
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                            {colors.length === 0 && (
                              <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                No colors found. Select a color from the palette above to add your first color.
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