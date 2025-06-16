"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ShoppingCart, TrendingUp, TrendingDown, ChevronLeft, X, Clock } from "lucide-react"
import { IncomeVoucherForm } from "./components/IncomeVoucherForm"
import { ExpenseVoucherForm } from "./components/ExpenseVoucherForm"
import { PurchaseForm } from "./components/PurchaseForm"
import { VouchersList } from "./components/VouchersList"
import { PurchasesList } from "./components/PurchasesList"
import { initializeFinancesData } from "./utils/initializeData"
import { toast } from "@/components/ui/use-toast"
import { useGlobalFormStatus } from "@/hooks/useFormPersistence"

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
  
  // Hook para verificar formularios pendientes
  const { pendingForms } = useGlobalFormStatus()

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

  // Restaurar estado del formulario activo al cargar
  useEffect(() => {
    const savedState = localStorage.getItem('finances_form_state')
    if (savedState) {
      try {
        const { activeForm: savedForm, timestamp } = JSON.parse(savedState)
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          setActiveForm(savedForm)
        } else {
          localStorage.removeItem('finances_form_state')
        }
      } catch (error) {
        localStorage.removeItem('finances_form_state')
      }
    }
  }, [])

  const handleCloseForm = () => {
    setActiveForm(null)
    // Guardar estado al cerrar
    const timestamp = Date.now()
    localStorage.setItem('finances_form_state', JSON.stringify({
      activeForm: null,
      timestamp
    }))
  }

  const handleMinimizeForm = (formType: FormType) => {
    if (formType) {
      setMinimizedForms(prev => ({
        ...prev,
        [formType]: true
      }))
      setActiveForm(null)
      // Guardar estado al minimizar
      const timestamp = Date.now()
      localStorage.setItem('finances_form_state', JSON.stringify({
        activeForm: null,
        timestamp
      }))
    }
  }

  const handleOpenForm = (formType: FormType) => {
    setActiveForm(formType)
    // Guardar estado al abrir
    const timestamp = Date.now()
    localStorage.setItem('finances_form_state', JSON.stringify({
      activeForm: formType,
      timestamp
    }))
  }

  // Función para verificar si un formulario tiene datos pendientes
  const hasFormPendingData = (formType: string) => {
    return pendingForms.includes(formType)
  }

  // Función para obtener tiempo restante de un formulario
  const getFormTimeRemaining = (formType: string) => {
    const savedData = localStorage.getItem(`form_${formType}`)
    if (!savedData) return null
    
    try {
      const parsed = JSON.parse(savedData)
      const remaining = parsed.expiresAt - Date.now()
      if (remaining > 0) {
        const minutes = Math.floor(remaining / (1000 * 60))
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
    } catch (error) {
      console.error('Error parsing form data:', error)
    }
    return null
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
    <div className="flex">
      {/* Barra lateral de pestañas minimizadas */}
      {(minimizedForms.income || minimizedForms.expense || minimizedForms.purchase) && (
        <div className="w-18 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-300 shadow-md flex flex-col items-center py-4 px-2">
          <div className="text-xs text-gray-600 text-center font-semibold mb-4 tracking-wide">Minimizados</div>
          <div className="flex flex-col space-y-3 items-center gap-2">
            {minimizedForms.income && (
              <button
                onClick={() => {
                  setMinimizedForms(prev => ({ ...prev, income: false }))
                  handleOpenForm('income')
                }}
                className={`w-20 h-16 ${hasFormPendingData('income') ? 'bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-400' : 'bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-400'} text-white rounded-lg text-xs font-medium flex items-center justify-center transform -rotate-90 whitespace-nowrap shadow-md transition-all duration-300 hover:shadow-lg border relative`}
                title={hasFormPendingData('income') ? 'Ingreso (Datos pendientes)' : 'Ingreso'}
              >
                {hasFormPendingData('income') && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse transform rotate-90"></div>
                )}
                Ingreso
              </button>
            )}
            {minimizedForms.expense && (
              <button
                onClick={() => {
                  setMinimizedForms(prev => ({ ...prev, expense: false }))
                  handleOpenForm('expense')
                }}
                className={`w-20 h-16 ${hasFormPendingData('expense') ? 'bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-400' : 'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-400'} text-white rounded-lg text-xs font-medium flex items-center justify-center transform -rotate-90 whitespace-nowrap shadow-md transition-all duration-300 hover:shadow-lg border relative`}
                title={hasFormPendingData('expense') ? 'Egreso (Datos pendientes)' : 'Egreso'}
              >
                {hasFormPendingData('expense') && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse transform rotate-90"></div>
                )}
                Egreso
              </button>
            )}
            {minimizedForms.purchase && (
              <button
                onClick={() => {
                  setMinimizedForms(prev => ({ ...prev, purchase: false }))
                  handleOpenForm('purchase')
                }}
                className={`w-20 h-16 ${hasFormPendingData('purchase') ? 'bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-400' : 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-400'} text-white rounded-lg text-xs font-medium flex items-center justify-center transform -rotate-90 whitespace-nowrap shadow-md transition-all duration-300 hover:shadow-lg border relative`}
                title={hasFormPendingData('purchase') ? 'Compras (Datos pendientes)' : 'Compras'}
              >
                {hasFormPendingData('purchase') && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse transform rotate-90"></div>
                )}
                Compras
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1 p-6 space-y-6">
      {/* Header con información de la empresa */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Solo mostrar la imagen del local sin lógica de cambio */}
          {storeConfig.logo && (
            <div className="w-16 h-16">
              <img 
                src={storeConfig.logo} 
                alt="Logo del Local" 
                className="w-16 h-16 object-contain rounded-lg border"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {storeConfig.name || "Sistema de Finanzas"}
            </h1>
            <p className="text-gray-600">Gestión de ingresos, egresos y compras</p>
          </div>
        </div>
      </div>

      {/* Grid dinámico basado en componentes minimizados */}
      <div className={`grid gap-6 ${
        // Calcular el número de columnas activas
        (() => {
          const activeColumns = [
            !minimizedForms.income,
            !minimizedForms.expense,
            !minimizedForms.purchase
          ].filter(Boolean).length;
          
          if (activeColumns === 1) return 'grid-cols-1';
          if (activeColumns === 2) return 'grid-cols-1 lg:grid-cols-2';
          return 'grid-cols-1 lg:grid-cols-3';
        })()
      }`}>
        {/* Columna 1: Comprobantes de Ingreso */}
        {!minimizedForms.income && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Comprobantes de Ingreso</span>
                    {hasFormPendingData('income') && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {getFormTimeRemaining('income')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMinimizeForm('income')}
                      className="hover:bg-gray-100 transition-colors duration-200"
                      title="Minimizar Comprobantes de Ingreso"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleOpenForm('income')}
                      className="bg-green-600 hover:bg-green-700 relative"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Nuevo
                      {hasFormPendingData('income') && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeForm === 'income' ? (
                  <IncomeVoucherForm onClose={handleCloseForm} />
                ) : (
                  <VouchersList type="income" />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Columna 2: Comprobantes de Egreso */}
        {!minimizedForms.expense && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span>Comprobantes de Egreso</span>
                    {hasFormPendingData('expense') && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {getFormTimeRemaining('expense')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMinimizeForm('expense')}
                      className="hover:bg-gray-100 transition-colors duration-200"
                      title="Minimizar Comprobantes de Egreso"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleOpenForm('expense')}
                      className="bg-red-600 hover:bg-red-700 relative"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Nuevo
                      {hasFormPendingData('expense') && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeForm === 'expense' ? (
                  <ExpenseVoucherForm onClose={handleCloseForm} />
                ) : (
                  <VouchersList type="expense" />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Columna 3: Compras */}
        {!minimizedForms.purchase && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    <span>Compras</span>
                    {hasFormPendingData('purchase') && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {getFormTimeRemaining('purchase')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMinimizeForm('purchase')}
                      className="hover:bg-gray-100 transition-colors duration-200"
                      title="Minimizar Compras"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleOpenForm('purchase')}
                      className="bg-blue-600 hover:bg-blue-700 relative"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Nueva
                      {hasFormPendingData('purchase') && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeForm === 'purchase' ? (
                  <PurchaseForm onClose={handleCloseForm} />
                ) : (
                  <PurchasesList />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}