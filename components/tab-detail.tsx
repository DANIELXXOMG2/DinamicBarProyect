"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CartItem } from "./cart-item"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { X, DollarSign } from "lucide-react"

interface TabItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    name: string
    price: number
  }
}

interface TabDetailProps {
  tab: {
    id: string
    name: string
    items: TabItem[]
    isActive: boolean
  }
  onUpdateQuantity?: (itemTitle: string, newQuantity: number) => void
}

export function TabDetail({ tab, onUpdateQuantity }: TabDetailProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [sheetOpen, setSheetOpen] = useState(false)

  const subtotal = tab.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const total = subtotal

  // Para la división de cuenta
  const selectedTotal = tab.items
    .filter(item => selectedItems[item.id])
    .reduce((acc, item) => acc + item.price * item.quantity, 0)

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleSelectAll = () => {
    const allSelected = tab.items.every(item => selectedItems[item.id])
    
    if (allSelected) {
      // Deseleccionar todos
      setSelectedItems({})
    } else {
      // Seleccionar todos
      const newSelection: Record<string, boolean> = {}
      tab.items.forEach(item => {
        newSelection[item.id] = true
      })
      setSelectedItems(newSelection)
    }
  }

  return (
    <div className="p-2 md:p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2 md:mb-4">
        <h2 className="text-lg md:text-xl font-bold">{tab.name}</h2>
        <div className="text-xs md:text-sm text-gray-500">{tab.id}</div>
      </div>

      <div className="flex-1 overflow-auto">
        {tab.items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No hay productos en esta mesa
          </div>
        ) : (
          tab.items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 mb-3 md:mb-4 p-2 border rounded-md">
              <div className="w-full sm:w-auto">
                <CartItem
                  title={item.product.name}
                  price={item.price}
                  quantity={item.quantity}
                  image="/placeholder.svg?height=64&width=64"
                />
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onUpdateQuantity?.(item.product.name, item.quantity - 1)}
                >
                  -
                </Button>
                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onUpdateQuantity?.(item.product.name, item.quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-3 md:pt-4 mt-3 md:mt-4">
        <div className="space-y-2 mb-3 md:mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sub Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button variant="outline" className="text-sm md:text-base">Guardar</Button>
          
          {/* Botón de dividir cuenta con Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                Dividir Cuenta
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Dividir Cuenta - {tab.name}</SheetTitle>
              </SheetHeader>
              
              <div className="flex justify-between items-center py-3 border-b">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {tab.items.every(item => selectedItems[item.id]) 
                    ? "Deseleccionar todos" 
                    : "Seleccionar todos"}
                </Button>
                <div className="text-sm font-medium">
                  Total: ${selectedTotal.toFixed(2)}
                </div>
              </div>
              
              <div className="py-4 max-h-[50vh] overflow-y-auto">
                {tab.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b">
                    <Checkbox 
                      id={`item-${item.id}`}
                      checked={!!selectedItems[item.id]}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                    />
                    <div className="flex flex-1 justify-between">
                      <label
                        htmlFor={`item-${item.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {item.product.name} ({item.quantity}x)
                      </label>
                      <span className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <SheetFooter className="pt-4 border-t">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!Object.values(selectedItems).some(Boolean)}
                >
                  Procesar Pago (${selectedTotal.toFixed(2)})
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          <Button 
            className="col-span-1 md:col-span-2 bg-green-600 hover:bg-green-700 text-white text-sm md:text-base"
          >
            Procesar Pago Completo
          </Button>
        </div>
      </div>
    </div>
  )
}
