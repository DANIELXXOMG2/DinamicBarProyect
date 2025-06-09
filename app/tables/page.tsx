"use client"

import { Header } from "@/components/header"
import { TableManagement } from "@/components/open-tabs"

export default function TablesPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <TableManagement />
      </main>
    </div>
  )
}