"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart, Package } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface ProductCardProps {
  id: string
  title: string
  price: number
  stock: number
  type: "Alc" | "NoAlc"
  image?: string
  onAddToTable?: (productId: string, quantity: number) => void
  canAddToTable?: boolean
}

export function ProductCard({ 
  id, 
  title, 
  price, 
  stock, 
  type, 
  image, 
  onAddToTable, 
  canAddToTable = false 
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)

  const handleAdd = () => {
    if (stock >= quantity) {
      setQuantity(quantity + 1)
    }
  }

  const handleRemove = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddToTable = () => {
    if (onAddToTable && canAddToTable && stock >= quantity) {
      onAddToTable(id, quantity)
      setQuantity(1) // Reset quantity after adding
    }
  }

  const isOutOfStock = stock === 0
  const isLowStock = stock > 0 && stock <= 5

  return (
    <div className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 transition-all duration-200 ${
      isOutOfStock ? 'opacity-50 bg-gray-100' : ''
    }`}>
      {/* Imagen del producto */}
      <div className="w-16 h-16 mr-3 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
        {image && !imageError ? (
          <Image
            src={image}
            alt={title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${
              type === "Alc" ? "bg-red-500" : "bg-green-500"
            }`}></span>
            <span className="text-xs text-gray-500">{type}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-green-600 font-bold text-lg">${price.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${
              isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-gray-500'
            }`}>
              Stock: {stock}
              {isOutOfStock && ' (Agotado)'}
              {isLowStock && !isOutOfStock && ' (Poco stock)'}
            </span>
          </div>
        </div>
      </div>

      {/* Controles de cantidad y agregar */}
      <div className="flex items-center gap-2 ml-4">
        {/* Selector de cantidad */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={handleRemove}
            disabled={quantity <= 1 || isOutOfStock}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-6 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={handleAdd}
            disabled={stock <= quantity || isOutOfStock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Botón agregar a mesa */}
        <Button
          onClick={handleAddToTable}
          disabled={!canAddToTable || isOutOfStock || stock < quantity}
          className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          Agregar
        </Button>
      </div>
    </div>
  )
}