"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, Clock, Package, Building, Eye } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { PurchaseItem, Purchase } from "../types/purchase"

export function PurchasesList() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null)

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const response = await fetch('/api/purchases')
        if (response.ok) {
          const data = await response.json()
          setPurchases((data.purchases || []).sort((a: Purchase, b: Purchase) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ))
        } else {
          throw new Error('API error')
        }
      } catch (error) {
        console.error('Error loading purchases from API, falling back to localStorage:', error)
        // Fallback a localStorage
        const stored = JSON.parse(localStorage.getItem('purchases') || '[]')
        setPurchases(stored.sort((a: Purchase, b: Purchase) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
      }
    }

    loadPurchases()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta compra?')) {
      try {
        const response = await fetch(`/api/purchases/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          const updatedPurchases = purchases.filter(p => p.id !== id)
          setPurchases(updatedPurchases)
          
          toast({
            title: "Éxito",
            description: "Compra eliminada correctamente"
          })
        } else {
          throw new Error('Error deleting from API')
        }
      } catch (error) {
        console.error('Error deleting from API, falling back to localStorage:', error)
        // Fallback a localStorage
        const updatedPurchases = purchases.filter(p => p.id !== id)
        setPurchases(updatedPurchases)
        localStorage.setItem('purchases', JSON.stringify(updatedPurchases))
        
        toast({
          title: "Éxito",
          description: "Compra eliminada correctamente"
        })
      }
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTotalAmount = () => {
    return purchases.reduce((sum, purchase) => sum + purchase.grandTotal, 0)
  }

  const toggleExpanded = (purchaseId: string) => {
    setExpandedPurchase(expandedPurchase === purchaseId ? null : purchaseId)
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hay compras registradas</p>
        <p className="text-sm">Haga clic en "Nueva" para agregar una</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen total */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Compras</p>
            <p className="text-2xl font-bold text-blue-600">
              ${getTotalAmount().toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {purchases.length} compra{purchases.length !== 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de compras */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header de la compra */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {purchase.companyImage ? (
                      <img
                        src={purchase.companyImage}
                        alt="Empresa"
                        className="w-12 h-12 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Building className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {purchase.supplierName}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(purchase.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{purchase.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Package className="w-3 h-3" />
                          <span>{purchase.items.length} producto{purchase.items.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        ${purchase.grandTotal.toFixed(2)}
                      </p>
                      {purchase.totalIva > 0 && (
                        <p className="text-xs text-gray-500">
                          IVA: ${purchase.totalIva.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(purchase.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(purchase.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {expandedPurchase === purchase.id && (
                  <div className="pt-3 border-t space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Productos:</h4>
                    <div className="space-y-2">
                      {purchase.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">{item.productName}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} x ${item.purchasePrice.toFixed(2)}
                                {item.iva && item.iva > 0 && ` + ${item.iva}% IVA`}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            ${item.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Totales detallados */}
                    <div className="pt-2 border-t space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${purchase.subtotal.toFixed(2)}</span>
                      </div>
                      {purchase.totalIva > 0 && (
                        <div className="flex justify-between">
                          <span>IVA Total:</span>
                          <span>${purchase.totalIva.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${purchase.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}