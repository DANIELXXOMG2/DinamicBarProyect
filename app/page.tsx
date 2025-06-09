"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"

export default function POSPage() {
  const router = useRouter()

  // Redirect to products page by default
  useEffect(() => {
    router.push("/products")
  }, [router])

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">{/* Content will be rendered in the layout */}</div>
    </div>
  )
}
