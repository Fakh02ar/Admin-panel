"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react"
import { ApiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchCategories()
    } else {
      setLoading(false)
    }
  }, [pagination.page, searchQuery, statusFilter, sortBy])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        search: searchQuery,
        limit: 10,
        status: statusFilter === "all" ? "" : statusFilter,
        sort: sortBy,
      })
      const data = await ApiClient.get(`/categories?${params}`)
      setCategories(data.data)
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

  const handleCreate = () => {
    setSelectedCategory(null)
    setDialogOpen(true)
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setDialogOpen(true)
  }

  const handleDelete = (category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await ApiClient.delete(`/categories/${categoryToDelete._id}`)
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
      fetchCategories()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const handleSave = () => {
    fetchCategories()
    setDialogOpen(false)
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories by name..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Created At</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category._id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{category.name}</td>
                        <td className="p-3">
                          <Badge variant={category.status === "active" ? "default" : "secondary"}>
                            {category.status}
                          </Badge>
                        </td>
                        <td className="p-3">{new Date(category.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(category)}>
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

      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={selectedCategory} onSave={handleSave} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete ${categoryToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  )
}
