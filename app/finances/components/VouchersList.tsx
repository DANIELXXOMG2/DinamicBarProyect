"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, Clock, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Voucher {
  id: string
  description: string
  amount: number
  date: string
  time: string
  category?: string
  createdAt: string
}

interface VouchersListProps {
  type: 'income' | 'expense'
}

export function VouchersList({ type }: VouchersListProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const storageKey = type === 'income' ? 'income_vouchers' : 'expense_vouchers'
  const title = type === 'income' ? 'Ingresos' : 'Egresos'
  const colorClass = type === 'income' ? 'text-green-600' : 'text-red-600'
  const bgColorClass = type === 'income' ? 'bg-green-50' : 'bg-red-50'

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const voucherType = type === 'income' ? 'INCOME' : 'EXPENSE'
        const response = await fetch(`/api/vouchers?type=${voucherType}`)
        
        if (response.ok) {
          const data = await response.json()
          setVouchers(data.vouchers || [])
        } else {
          console.error('Error loading vouchers from API')
          // Fallback a localStorage si la API falla
          const stored = JSON.parse(localStorage.getItem(storageKey) || '[]')
          setVouchers(stored.sort((a: Voucher, b: Voucher) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ))
        }
      } catch (error) {
        console.error('Error loading vouchers:', error)
        // Fallback a localStorage en caso de error
        const stored = JSON.parse(localStorage.getItem(storageKey) || '[]')
        setVouchers(stored.sort((a: Voucher, b: Voucher) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
      }
    }

    loadVouchers()
  }, [type, storageKey])

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este comprobante?')) {
      try {
        const response = await fetch(`/api/vouchers/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const updatedVouchers = vouchers.filter(v => v.id !== id)
          setVouchers(updatedVouchers)
          
          toast({
            title: "Éxito",
            description: "Comprobante eliminado correctamente"
          })
        } else {
          throw new Error('Error al eliminar el comprobante')
        }
      } catch (error) {
        console.error('Error deleting voucher:', error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el comprobante",
          variant: "destructive"
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
    return vouchers.reduce((sum, voucher) => sum + voucher.amount, 0)
  }

  if (vouchers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hay {title.toLowerCase()} registrados</p>
        <p className="text-sm">Haga clic en "Nuevo" para agregar uno</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen total */}
      <Card className={bgColorClass}>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total {title}</p>
            <p className={`text-2xl font-bold ${colorClass}`}>
              ${getTotalAmount().toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de comprobantes */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {vouchers.map((voucher) => (
          <Card key={voucher.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">
                    {voucher.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(voucher.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{voucher.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold ${colorClass}`}>
                    ${voucher.amount.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(voucher.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}