"use client"

import { ProductCard } from "@/components/product-card"
import { useState, useEffect, useMemo } from "react"
import { toast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  purchasePrice: number
  salePrice: number
  stock: number
  type: "ALCOHOLIC" | "NON_ALCOHOLIC"
  image?: string
  category: {
    name: string
  }
}

interface ProductsListProps {
  category?: string
  searchQuery?: string
  selectedTable?: string | null
  onProductsLoad?: (categoryCounts: Record<string, number>) => void
}

export function ProductsList({ category = "Cervezas", searchQuery = "", selectedTable, onProductsLoad }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/inventory/products')
      if (response.ok) {
        const { products } = await response.json()
        setProducts(products)
        
        // Calcular conteos por categoría
        const categoryCounts = products.reduce((acc: Record<string, number>, product: Product) => {
          const categoryName = product.category.name
          acc[categoryName] = (acc[categoryName] || 0) + 1
          return acc
        }, {})
        
        onProductsLoad?.(categoryCounts)
      } else {
        setError('Error al cargar los productos')
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setError('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrado eficiente por búsqueda y categoría
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Filtrar por categoría si no hay búsqueda
    if (!searchQuery.trim()) {
      filtered = products.filter((product) => product.category.name === category)
    } else {
      // Filtrar por búsqueda (búsqueda en tiempo real por cada carácter)
      const query = searchQuery.toLowerCase().trim()
      filtered = products.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query)
        const categoryMatch = product.category.name.toLowerCase().includes(query)
        const priceMatch = product.salePrice.toString().includes(query)
        return nameMatch || categoryMatch || priceMatch
      })
    }

    return filtered
  }, [products, category, searchQuery])

  const handleAddToTable = async (productId: string, quantity: number = 1) => {
    if (!selectedTable) {
      toast({
        title: "Mesa no seleccionada",
        description: "Por favor selecciona una mesa antes de agregar productos.",
        variant: "destructive"
      })
      return
    }

    try {
      const product = products.find(p => p.id === productId)
      if (!product) {
        throw new Error('Producto no encontrado')
      }

      const response = await fetch(`/api/tabs/${selectedTable}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          price: product.salePrice
        })
      })

      if (response.ok) {
        toast({
          title: "Producto agregado",
          description: `${product.name} agregado a la mesa.`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al agregar producto')
      }
    } catch (error) {
      console.error('Error adding product to table:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar producto a la mesa.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Cargando productos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">
          {searchQuery.trim() 
            ? `No se encontraron productos para "${searchQuery}"`
            : "No hay productos en esta categoría"
          }
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {searchQuery.trim() && (
        <div className="text-sm text-gray-600 mb-3">
          {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para "{searchQuery}"
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.name}
            salePrice={product.salePrice}
            stock={product.stock}
            type={product.type === "ALCOHOLIC" ? "Alc" : "NoAlc"}
            image={product.image}
            onAddToTable={handleAddToTable}
            canAddToTable={!!selectedTable}
          />
        ))}
      </div>
    </div>
  )
}