"use client"

import { Header } from "@/components/header"
import { ProductCategories } from "@/components/product-categories"
import { ProductsList } from "@/components/products-list"
import { TableSelector } from "@/components/table-selector"
import { SearchBar } from "@/components/search-bar"
import { useState, useEffect } from "react"

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("Cervezas")
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showTableSelector, setShowTableSelector] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticación
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    console.log("🔍 Verificando autenticación en página de productos")
    
    if (!storedUser) {
      console.log("🚫 No hay usuario en localStorage, redirigiendo a login")
      window.location.href = '/login'
      return
    }
    
    try {
      const user = JSON.parse(storedUser)
      console.log("✅ Usuario autenticado:", user)
      setIsLoading(false)
    } catch (error) {
      console.error("❌ Error al procesar usuario:", error)
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }, [])

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Atajos de categorías (Alt + número)
      if (e.altKey && !isNaN(Number.parseInt(e.key)) && Number.parseInt(e.key) >= 1 && Number.parseInt(e.key) <= 7) {
        const categories = ["Cervezas", "Licores", "Snaks", "Gaseosas", "Miscelánea", "Cigarrería", "Cacharrería"]
        const selectedCategory = categories[Number.parseInt(e.key) - 1]
        if (selectedCategory) {
          setActiveCategory(selectedCategory)
        }
      }
      
      // Atajo para enfocar búsqueda (Alt + F)
      if (e.altKey && e.key === 'f') {
        e.preventDefault()
        const searchInput = document.getElementById('product-search')
        searchInput?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const handleProductsLoad = (counts: Record<string, number>) => {
    setCategoryCounts(counts)
  }

  const handleTableSelect = (tableId: string, tableName: string) => {
    setSelectedTable(tableId)
    setSelectedTableName(tableName)
    setShowTableSelector(false)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto p-4">
        {/* Barra de búsqueda y selector de mesa */}
        <div className="flex flex-col md:flex-row justify-between gap-2 md:items-center mb-4">
          <SearchBar 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar productos..."
            className="flex-1"
          />
          
          {/* Selector de mesa */}
          <div className="flex items-center mb-4 gap-2">
            <button
              onClick={() => setShowTableSelector(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {selectedTable ? `Mesa: ${selectedTableName}` : "Seleccionar Mesa"}
            </button>
            {selectedTable && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Mesa activa
              </div>
            )}
          </div>
        </div>

        {/* Categorías de productos */}
        <ProductCategories 
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          categoryCounts={categoryCounts}
        />
        
        {/* Lista de productos */}
        <ProductsList 
          category={activeCategory}
          searchQuery={searchQuery}
          selectedTable={selectedTable}
          onProductsLoad={handleProductsLoad}
        />
      </main>
      
      {/* Modal selector de mesa */}
      {showTableSelector && (
        <TableSelector
          onSelect={handleTableSelect}
          onClose={() => setShowTableSelector(false)}
        />
      )}
    </div>
  )
}