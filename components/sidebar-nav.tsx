"use client"

import { Beer, TableIcon, Calculator, Settings, LogOut, Package, DollarSign, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ShoppingCart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { useGlobalFormStatus } from "@/hooks/useFormPersistence"

// Definición del tipo User para TypeScript
type UserRole = 'ADMIN' | 'CASHIER' | 'WAITER'
type User = {
  id: string
  username: string
  role: UserRole
}

const navItems = [
  { name: "Bebidas", href: "/", icon: Beer },
  { name: "Mesas", href: "/tables", icon: TableIcon },
  { name: "Inventario", href: "/inventory", icon: Package },
  { name: "Finanzas", href: "/finances", icon: DollarSign },
]

export function SidebarNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { pendingForms } = useGlobalFormStatus()
  const [storeConfig, setStoreConfig] = useState({
    name: "",
    logo: "",
  })
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  // Cargar preferencias de sidebar al inicio
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed")
    if (savedCollapsedState) {
      setCollapsed(savedCollapsedState === "true")
    }
  }, [])

  // Guardar preferencias de sidebar cuando cambie
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed.toString())
  }, [collapsed])

  // Cargar usuario actual
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    } else {
      // Si no hay usuario en localStorage, redirigir al login
      router.push('/login')
    }
  }, [router])

  // Cargar configuración del local y escuchar cambios
  useEffect(() => {
    const loadStoreConfig = async () => {
      try {
        // Intentar cargar desde la API primero
        const response = await fetch('/api/store')
        if (response.ok) {
          const { store } = await response.json()
          if (store) {
            const config = {
              name: store.name,
              logo: store.image
            }
            setStoreConfig(config)
            // Sincronizar con localStorage
            localStorage.setItem("storeConfig", JSON.stringify(config))
            return
          }
        }
      } catch (error) {
        console.warn('Error loading store config from API, falling back to localStorage:', error)
      }
      
      // Fallback a localStorage si la API falla
      const savedConfig = localStorage.getItem("storeConfig")
      if (savedConfig) {
        setStoreConfig(JSON.parse(savedConfig))
      }
    }

    // Cargar configuración inicial
    loadStoreConfig()

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "storeConfig") {
        const savedConfig = localStorage.getItem("storeConfig")
        if (savedConfig) {
          setStoreConfig(JSON.parse(savedConfig))
        }
      }
    }

    // Escuchar evento personalizado para cambios internos
    const handleConfigUpdate = () => {
      loadStoreConfig()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('storeConfigUpdated', handleConfigUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('storeConfigUpdated', handleConfigUpdate)
    }
  }, [])

  // Calcular tiempo restante para formularios pendientes
  useEffect(() => {
    if (pendingForms.length === 0) {
      setTimeRemaining('')
      return
    }

    const updateTimeRemaining = () => {
      let minTimeRemaining = Infinity
      
      pendingForms.forEach(formKey => {
        const savedData = localStorage.getItem(`form_${formKey}`)
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData)
            const remaining = parsed.expiresAt - Date.now()
            if (remaining > 0 && remaining < minTimeRemaining) {
              minTimeRemaining = remaining
            }
          } catch (error) {
            console.error('Error parsing form data:', error)
          }
        }
      })

      if (minTimeRemaining !== Infinity && minTimeRemaining > 0) {
        const minutes = Math.floor(minTimeRemaining / (1000 * 60))
        const seconds = Math.floor((minTimeRemaining % (1000 * 60)) / 1000)
        setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeRemaining('')
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [pendingForms])

  // Función para traducir el rol a español
  const translateRole = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador'
      case 'CASHIER':
        return 'Cajero'
      case 'WAITER':
        return 'Mesero'
      default:
        return role
    }
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('user')
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    })
    router.push('/login')
  }

  return (
    <div className={`${collapsed ? "w-16" : "w-64"} p-4 border-r h-screen flex flex-col transition-all duration-200`}>
      <div className={`${collapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between"} mb-8`}>
        <div className="flex items-center gap-2">
          {storeConfig.logo ? (
            <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={storeConfig.logo}
                alt={`Logo de ${storeConfig.name || 'Restaurante'}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                  // Intentar con una imagen en base64 como último recurso
                  e.currentTarget.onerror = () => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='3' width='20' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='12' y1='8' x2='12' y2='16'%3E%3C/line%3E%3Cline x1='8' y1='12' x2='16' y2='12'%3E%3C/line%3E%3C/svg%3E";
                  };
                }}
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
          )}
          {!collapsed && <span className="font-semibold">{storeConfig.name || 'Restaurante'}</span>}
        </div>
        
        {!collapsed ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${pathname === "/settings" ? "bg-gray-100 text-gray-700" : "text-gray-600"}`}
              onClick={() => router.push("/settings")}
              aria-label="Configuración"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expandir" : "Colapsar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expandir" : "Colapsar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${pathname === "/settings" ? "bg-gray-100 text-gray-700" : "text-gray-600"}`}
              onClick={() => router.push("/settings")}
              aria-label="Configuración"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {currentUser && (
        <div className={`flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-md ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{currentUser.username}</span>
              <span className="text-xs text-gray-500">{translateRole(currentUser.role)}</span>
            </div>
          )}
        </div>
      )}

      <nav className="space-y-2 flex-1">
        {navItems.map((item, index) => {
          const isFinances = item.href === '/finances'
          const hasPendingForms = pendingForms.length > 0
          
          return (
            <div key={index}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-${collapsed ? "center" : "start"} ${
                  pathname === item.href 
                    ? "bg-green-100 text-green-700" 
                    : isFinances && hasPendingForms 
                      ? "text-red-600 bg-red-50" 
                      : "text-gray-600"
                }`}
                data-shortcut={index + 1}
                onClick={() => router.push(item.href)}
              >
                <item.icon className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
                {!collapsed && item.name}
                {isFinances && hasPendingForms && !collapsed && (
                  <div className="ml-auto flex items-center space-x-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </div>
                )}
              </Button>
              
              {/* Mostrar iconos de formularios pendientes solo en finanzas */}
              {isFinances && hasPendingForms && !collapsed && (
                <div className="ml-4 mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs text-red-600 font-medium">
                    <span>Formularios pendientes:</span>
                    {timeRemaining && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{timeRemaining}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    {pendingForms.includes('income_voucher') && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>Ingreso</span>
                      </div>
                    )}
                    {pendingForms.includes('expense_voucher') && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <TrendingDown className="h-3 w-3" />
                        <span>Egreso</span>
                      </div>
                    )}
                    {pendingForms.includes('purchase') && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <ShoppingCart className="h-3 w-3" />
                        <span>Compra</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="space-y-2 mt-auto">
        <Button 
          variant="ghost" 
          className={`w-full justify-${collapsed ? "center" : "start"} ${pathname === "/sales" ? "bg-green-100 text-green-700" : "text-gray-600"}`}
          onClick={() => router.push("/sales")}
        >
          <Calculator className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
          {!collapsed && "Ventas"}
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-${collapsed ? "center" : "start"} ${pathname === "/cash-register" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
          onClick={() => router.push("/cash-register")}
        >
          <DollarSign className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
          {!collapsed && "Caja Registradora"}
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-${collapsed ? "center" : "start"} text-gray-600`}
          onClick={handleLogout}
        >
          <LogOut className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
          {!collapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  )
}
