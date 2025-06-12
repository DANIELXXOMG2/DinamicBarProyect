"use client"

import React from "react"
import { SidebarNav } from "@/components/sidebar-nav"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      {children}
    </div>
  )
} 