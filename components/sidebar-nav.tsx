"use client"

import { Beer, TableIcon, Calculator, Settings, LogOut, Package, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

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
  { name: "Ventas", href: "/sales", icon: Calculator },
  { name: "Configuración", href: "/settings", icon: Settings },
]

export function SidebarNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [storeConfig, setStoreConfig] = useState({
    name: "",
    logo: "",
  })
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [collapsed, setCollapsed] = useState(false)

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
      <div className="flex items-center justify-between mb-8">
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
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={`w-full justify-${collapsed ? "center" : "start"} ${pathname === item.href ? "bg-green-100 text-green-700" : "text-gray-600"}`}
            data-shortcut={index + 1}
            onClick={() => router.push(item.href)}
          >
            <item.icon className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
            {!collapsed && item.name}
          </Button>
        ))}
      </nav>
      <div className="space-y-2 mt-auto">
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
