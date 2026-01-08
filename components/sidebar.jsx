"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Package, FolderTree, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    icon: FolderTree,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setCollapsed(true)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 lg:sticky",
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-64",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            {!collapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-bold">A</span>
                </div>
                <span className="font-semibold text-sidebar-foreground">Admin Panel</span>
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="lg:hidden">
              {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  title={collapsed ? link.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Toggle button for desktop */}
          <div className="hidden lg:flex items-center justify-center p-4 border-t border-sidebar-border">
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
