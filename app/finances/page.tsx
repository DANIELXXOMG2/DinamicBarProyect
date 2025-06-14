"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Plus, FileText, ShoppingCart, TrendingUp, TrendingDown, Minimize2, Maximize2, X } from "lucide-react"
import { IncomeVoucherForm } from "./components/IncomeVoucherForm"
import { ExpenseVoucherForm } from "./components/ExpenseVoucherForm"
import { PurchaseForm } from "./components/PurchaseForm"
import { VouchersList } from "./components/VouchersList"
import { PurchasesList } from "./components/PurchasesList"
import { initializeFinancesData } from "./utils/initializeData"
import { toast } from "@/components/ui/use-toast"

type VoucherType = 'income' | 'expense'
type FormType = 'income' | 'expense' | 'purchase' | null

interface MinimizedState {
  income: boolean
  expense: boolean
  purchase: boolean
}

export default function FinancesPage() {
  const [activeForm, setActiveForm] = useState<FormType>(null)
  const [minimizedForms, setMinimizedForms] = useState<MinimizedState>({
    income: false,
    expense: false,
    purchase: false
  })
  const [storeConfig, setStoreConfig] = useState({
    name: "",
    logo: "",
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  // Cargar configuración de la tienda e inicializar datos
  useEffect(() => {
    // Inicializar datos básicos
    initializeFinancesData()
    
    // Cargar configuración de la tienda
    const config = localStorage.getItem('storeConfig')
    if (config) {
      setStoreConfig(JSON.parse(config))
    }
  }, [])

  // Persistencia de formularios (1 hora)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeForm) {
        const timestamp = Date.now()
        localStorage.setItem('finances_form_state', JSON.stringify({
          activeForm,
          timestamp
        }))
      }
    }

    // Restaurar estado al cargar
    const savedState = localStorage.getItem('finances_form_state')
    if (savedState) {
      const { activeForm: savedForm, timestamp } = JSON.parse(savedState)
      const oneHour = 60 * 60 * 1000
      if (Date.now() - timestamp < oneHour) {
        setActiveForm(savedForm)
      } else {
        localStorage.removeItem('finances_form_state')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [activeForm])

  const handleCloseForm = () => {
    setActiveForm(null)
    localStorage.removeItem('finances_form_state')
  }

  const handleMinimizeForm = (formType: FormType) => {
    if (formType) {
      setMinimizedForms(prev => ({
        ...prev,
        [formType]: !prev[formType]
      }))
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive"
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive"
      })
      return
    }

    setUploadingImage(true)

    try {
      // Convertir a base64 para almacenamiento local
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string
        
        const updatedConfig = {
          ...storeConfig,
          logo: imageUrl
        }
        
        setStoreConfig(updatedConfig)
        localStorage.setItem('storeConfig', JSON.stringify(updatedConfig))
        
        // Intentar actualizar en la base de datos
        try {
          const response = await fetch('/api/store', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageUrl })
          })
          
          if (response.ok) {
            // Disparar evento para actualizar otros componentes
            window.dispatchEvent(new Event('storeConfigUpdated'))
          }
        } catch (error) {
          console.warn('Error updating store image in database:', error)
        }
        
        toast({
          title: "Éxito",
          description: "Imagen de empresa actualizada correctamente"
        })
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "Error al cargar la imagen",
        variant: "destructive"
      })
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con información de la empresa */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            {storeConfig.logo ? (
              <div className="relative">
                <img 
                  src={storeConfig.logo} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingImage}
            />
            {uploadingImage && (
              <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {storeConfig.name || "Sistema de Finanzas"}
            </h1>
            <p className="text-gray-600">Gestión de ingresos, egresos y compras</p>
            {!storeConfig.logo && (
              <p className="text-sm text-gray-500 mt-1">Haz clic en el + para agregar logo de empresa</p>
            )}
          </div>
        </div>
      </div>

      {/* Grid de tres columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Comprobantes de Ingreso */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Comprobantes de Ingreso</span>
                </div>
                <div className="flex items-center space-x-2">
                  {activeForm === 'income' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMinimizeForm('income')}
                    >
                      {minimizedForms.income ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => setActiveForm(activeForm === 'income' ? null : 'income')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {activeForm === 'income' ? (
                      <X className="w-4 h-4 mr-1" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1" />
                    )}
                    {activeForm === 'income' ? 'Cerrar' : 'Nuevo'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {(!minimizedForms.income || activeForm !== 'income') && (
              <CardContent>
                {activeForm === 'income' ? (
                  <IncomeVoucherForm onClose={handleCloseForm} />
                ) : (
                  <VouchersList type="income" />
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Columna 2: Comprobantes de Egreso */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span>Comprobantes de Egreso</span>
                </div>
                <div className="flex items-center space-x-2">
                  {activeForm === 'expense' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMinimizeForm('expense')}
                    >
                      {minimizedForms.expense ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => setActiveForm(activeForm === 'expense' ? null : 'expense')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {activeForm === 'expense' ? (
                      <X className="w-4 h-4 mr-1" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1" />
                    )}
                    {activeForm === 'expense' ? 'Cerrar' : 'Nuevo'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {(!minimizedForms.expense || activeForm !== 'expense') && (
              <CardContent>
                {activeForm === 'expense' ? (
                  <ExpenseVoucherForm onClose={handleCloseForm} />
                ) : (
                  <VouchersList type="expense" />
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Columna 3: Compras */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span>Compras</span>
                </div>
                <div className="flex items-center space-x-2">
                  {activeForm === 'purchase' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMinimizeForm('purchase')}
                    >
                      {minimizedForms.purchase ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => setActiveForm(activeForm === 'purchase' ? null : 'purchase')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {activeForm === 'purchase' ? (
                      <X className="w-4 h-4 mr-1" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1" />
                    )}
                    {activeForm === 'purchase' ? 'Cerrar' : 'Nueva'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {(!minimizedForms.purchase || activeForm !== 'purchase') && (
              <CardContent>
                {activeForm === 'purchase' ? (
                  <PurchaseForm onClose={handleCloseForm} />
                ) : (
                  <PurchasesList />
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}