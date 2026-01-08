"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, FolderTree, TrendingUp } from "lucide-react"
import { ApiClient } from "@/lib/api"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    categories: 0,
    loading: true,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchStats()
    } else {
      setStats(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, categoriesRes] = await Promise.all([
        ApiClient.get("/users?limit=1"),
        ApiClient.get("/products?limit=1"),
        ApiClient.get("/categories?limit=1"),
      ])

      setStats({
        users: usersRes.pagination.total,
        products: productsRes.pagination.total,
        categories: categoriesRes.pagination.total,
        loading: false,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      setStats((prev) => ({ ...prev, loading: false }))
      // Don't show error toast here as it might be annoying on every page load
    }
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats.users,
      icon: Users,
      description: "Registered users in the system",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Products",
      value: stats.products,
      icon: Package,
      description: "Products in inventory",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total Categories",
      value: stats.categories,
      icon: FolderTree,
      description: "Product categories",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ]

  if (stats.loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Stats Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">Total Users</span>
              <span className="text-sm text-muted-foreground">{stats.users} accounts</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-medium">Total Products</span>
              <span className="text-sm text-muted-foreground">{stats.products} items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Categories</span>
              <span className="text-sm text-muted-foreground">{stats.categories} groups</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
