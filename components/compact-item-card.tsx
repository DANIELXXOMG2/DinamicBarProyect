"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"

interface CompactItemCardProps {
  title: string
  price: number
  stock: number
  type: "Alc" | "NoAlc"
  onAdd?: () => void
  onRemove?: () => void
}

export function CompactItemCard({ title, price, stock, type, onAdd, onRemove }: CompactItemCardProps) {
  const [quantity, setQuantity] = useState(0)

  const handleAdd = () => {
    if (stock > quantity) {
      setQuantity(quantity + 1)
      if (onAdd) onAdd()
    }
  }

  const handleRemove = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1)
      if (onRemove) onRemove()
    }
  }

  return (
    <div className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 focus-within:ring-2 focus-within:ring-green-500">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${type === "Alc" ? "bg-red-500" : "bg-green-500"}`}></span>
            <span className="text-xs text-gray-500">{type}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-green-600 font-bold">${price.toFixed(2)}</span>
          <span className="text-xs text-gray-500">Stock: {stock}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={handleRemove}
          disabled={quantity === 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-sm font-medium w-4 text-center">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={handleAdd}
          disabled={stock <= quantity}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
