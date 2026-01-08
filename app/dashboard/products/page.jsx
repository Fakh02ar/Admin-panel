"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, Search, Pencil, Trash2, Loader2, Package, Eye } from "lucide-react"
import { ApiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ProductDialog } from "@/components/products/product-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchCategories()
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [pagination.page, searchQuery, categoryFilter, statusFilter, sortBy])

  const fetchCategories = async () => {
    try {
      const data = await ApiClient.get("/categories?limit=100")
      setCategories(data.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        search: searchQuery,
        category: categoryFilter,
        status: statusFilter === "all" ? "" : statusFilter,
        sort: sortBy,
        limit: 10,
      })
      const data = await ApiClient.get(`/products?${params}`)
      setProducts(data.data)
      setPagination(data.pagination)
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setPagination({ ...pagination, page: 1 })
  }

  const handleCategoryFilter = (value) => {
    setCategoryFilter(value === "all" ? "" : value)
    setPagination({ ...pagination, page: 1 })
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setPagination({ ...pagination, page: 1 })
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setPagination({ ...pagination, page: 1 })
  }

  const handleCreate = () => {
    setSelectedProduct(null)
    setDialogOpen(true)
  }

  const handleView = (product) => {
    setSelectedProduct(product)
    setViewDialogOpen(true)
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const handleDelete = (product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await ApiClient.delete(`/products/${productToDelete._id}`)
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
    setDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  const handleSave = () => {
    fetchProducts()
    setDialogOpen(false)
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by title or description..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Select value={categoryFilter || "all"} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-left p-3 font-medium">Price</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Created At</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image.startsWith("http") ? product.image : `${window.location.origin}${product.image}`}
                                alt={product.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{product.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">${product.price.toFixed(2)}</td>
                        <td className="p-3">{product.category?.name || "N/A"}</td>
                        <td className="p-3">
                          <Badge variant={product.status === "active" ? "default" : "secondary"}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="p-3">{new Date(product.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(product)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        categories={categories}
        onSave={handleSave}
      />

      <ProductDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        product={selectedProduct}
        categories={categories}
        viewOnly={true}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete ${productToDelete?.title}? This action cannot be undone.`}
      />
    </div>
  )
}
