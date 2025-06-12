import { CompactItemCard } from "./compact-item-card"
import { useState, useEffect } from "react"

interface Product {
  id: string
  name: string
  salePrice: number
  stock: number
  type: "ALCOHOLIC" | "NON_ALCOHOLIC"
  image?: string
  category: {
    name: string
  }
}

interface DrinksListProps {
  category?: string
  onProductsLoad?: (categoryCounts: Record<string, number>) => void
}

export function DrinksList({ category = "Cervezas", onProductsLoad }: DrinksListProps) {
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

  const filteredProducts = products.filter((product) => product.category.name === category)

  if (filteredProducts.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">No hay productos en esta categoría</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filteredProducts.map((product) => (
        <CompactItemCard
          key={product.id}
          title={product.name}
          price={product.salePrice}
          stock={product.stock}
          type={product.type === "ALCOHOLIC" ? "Alc" : "NoAlc"}
        />
      ))}
    </div>
  )
}
