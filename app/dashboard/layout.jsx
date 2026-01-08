"use client"

import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/middleware/auth-guard"

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
