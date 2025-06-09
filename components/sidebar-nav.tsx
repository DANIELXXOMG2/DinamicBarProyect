"use client"

import { Beer, TableIcon, Calculator, Settings, LogOut, Package, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

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

  return (
    <div className="w-64 p-4 border-r h-screen flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <img
          src={storeConfig.logo || "/placeholder.svg"}
          alt={`Logo de ${storeConfig.name}`}
          className="w-8 h-8 rounded object-cover"
        />
        <span className="font-semibold">{storeConfig.name}</span>
      </div>
      <nav className="space-y-2 flex-1">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={`w-full justify-start ${pathname === item.href ? "bg-green-100 text-green-700" : "text-gray-600"}`}
            data-shortcut={index + 1}
            onClick={() => router.push(item.href)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </nav>
      <div className="space-y-2 mt-auto">
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${pathname === "/cash-register" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
          onClick={() => router.push("/cash-register")}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Caja Registradora
        </Button>
        <Button variant="ghost" className="w-full justify-start text-gray-600">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
