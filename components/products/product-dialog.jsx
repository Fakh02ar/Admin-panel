"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"

export function ProductDialog({ open, onOpenChange, product, categories, onSave, viewOnly = false }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    category: "",
    status: "active",
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        image: product.image,
        category: product.category?._id || "",
        status: product.status,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        price: "",
        image: "",
        category: "",
        status: "active",
      })
    }
  }, [product])

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setImageUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append("image", file)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formDataUpload,
      })

      const data = await response.json()

      if (data.success) {
        setFormData({ ...formData, image: data.data.path })
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setImageUploading(false)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.price || !formData.category) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const payload = {
        ...formData,
        price: Number.parseFloat(formData.price),
      }

      if (product) {
        await ApiClient.put(`/products/${product._id}`, payload)
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        await ApiClient.post("/products", payload)
        toast({
          title: "Success",
          description: "Product created successfully",
        })
      }

      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {viewOnly ? "View Product" : product ? "Edit Product" : "Create Product"}
            </DialogTitle>
            <DialogDescription>
              {viewOnly ? "Product details" : product ? "Update product information" : "Add a new product to the inventory"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter product title"
                required
                disabled={viewOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={4}
                required
                disabled={viewOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                  disabled={viewOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={viewOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="space-y-2">
                {formData.image && (
                  <div className="relative inline-block">
                    <img
                      src={
                        formData.image.startsWith("http")
                          ? formData.image
                          : formData.image.startsWith("data:")
                            ? formData.image
                            : `${window.location.origin}${formData.image}`
                      }
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeImage}
                      disabled={viewOnly}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {!viewOnly && (
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="w-full"
                    >
                      {imageUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {formData.image ? "Change Image" : "Upload Image"}
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })} disabled={viewOnly}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {viewOnly ? "Close" : "Cancel"}
            </Button>
            {!viewOnly && (
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : product ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
