"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useFormPersistence } from "@/hooks/useFormPersistence"

interface IncomeVoucherFormProps {
  onClose: () => void
}

interface IncomeVoucher {
  id: string
  description: string
  amount: number
  date: string
  time: string
  createdAt: string
}

export function IncomeVoucherForm({ onClose }: IncomeVoucherFormProps) {
  const [voucher, setVoucher] = useState({
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  })
  const [saving, setSaving] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)

  // Hook de persistencia de formularios
  const {
    saveFormData,
    loadFormData,
    clearFormData,
    isLoaded
  } = useFormPersistence('income')

  // Cargar datos persistidos al montar el componente
  useEffect(() => {
    const savedData = loadFormData()
    if (savedData) {
      setVoucher(savedData.voucher || voucher)
      
      toast({
        title: "Datos recuperados",
        description: "Se han cargado los datos guardados del formulario"
      })
    }
  }, [])

  // Guardar datos automáticamente cuando cambien (solo después de cargar)
  useEffect(() => {
    if (isLoaded && (voucher.description || voucher.amount > 0)) {
      const formData = { voucher }
      saveFormData(formData)
    }
  }, [voucher, saveFormData, isLoaded])

  const handleCancel = () => {
    if (cancelConfirm) {
      // Segundo clic - confirmar cancelación
      clearFormData()
      setVoucher({
        description: "",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5)
      })
      onClose()
    } else {
      // Primer clic - activar confirmación
      setCancelConfirm(true)
      setTimeout(() => setCancelConfirm(false), 3000)
    }
  }

  const handleSubmit = async () => {
    if (!voucher.description.trim() || voucher.amount <= 0) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    
    try {
      // Guardar usando la API
      const response = await fetch('/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'INCOME',
          amount: voucher.amount,
          description: voucher.description,
          date: `${voucher.date}T${voucher.time}:00.000Z`
        })
      })

      if (!response.ok) {
        throw new Error('Error al crear el comprobante')
      }

      // Limpiar datos persistidos después del éxito
      clearFormData()
      
      toast({
        title: "Éxito",
        description: "Comprobante de ingreso creado correctamente"
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear el comprobante",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Nuevo Comprobante de Ingreso</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Fecha y Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={voucher.date}
              onChange={(e) => setVoucher({ ...voucher, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="time">Hora *</Label>
            <Input
              id="time"
              type="time"
              value={voucher.time}
              onChange={(e) => setVoucher({ ...voucher, time: e.target.value })}
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <Label htmlFor="description">Descripción/Razón *</Label>
          <Textarea
            id="description"
            placeholder="Describe el motivo del ingreso..."
            value={voucher.description}
            onChange={(e) => setVoucher({ ...voucher, description: e.target.value })}
            rows={3}
          />
        </div>

        {/* Valor */}
        <div>
          <Label htmlFor="amount">Valor *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={voucher.amount || ''}
            onChange={(e) => setVoucher({ ...voucher, amount: parseFloat(e.target.value) || 0 })}
          />
        </div>

        {/* Botones */}
        <div className="flex space-x-2 pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !voucher.description.trim() || voucher.amount <= 0}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Comprobante"}
          </Button>
          <Button 
            variant={cancelConfirm ? "destructive" : "outline"} 
            onClick={handleCancel}
            className={cancelConfirm ? "animate-pulse" : ""}
          >
            {cancelConfirm ? "¿Confirmar cancelar?" : "Cancelar"}
          </Button>
        </div>
      </div>
    </div>
  )
}