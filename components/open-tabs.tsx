"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Edit2, Check } from "lucide-react"
import { TabDetail } from "./tab-detail"
import { toast } from "@/hooks/use-toast"

// Definir los tipos basados en la API
interface Product {
  id: string
  name: string
  salePrice: number
  purchasePrice: number
  stock: number
  type: "ALCOHOLIC" | "NON_ALCOHOLIC"
  image?: string
  categoryId: string
  category: {
    id: string
    name: string
  }
}

interface TabItem {
  id: string
  tabId: string
  productId: string
  quantity: number
  price: number
  product: Product
}

interface Tab {
  id: string
  name: string
  items: TabItem[]
  isActive: boolean
  subtotal?: number
  total?: number
  createdAt?: string
  updatedAt?: string
}

export function TableManagement() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [loading, setLoading] = useState(true)
  const [newTabName, setNewTabName] = useState("Mesa")
  const [nameError, setNameError] = useState("")
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingTabName, setEditingTabName] = useState("")

  useEffect(() => {
    loadTabs()
  }, [])

  const loadTabs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tabs')
      if (response.ok) {
        const { tabs } = await response.json()
        setTabs(tabs)
      } else {
        toast({
          title: "Error",
          description: "Error al cargar las mesas",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading tabs:', error)
      toast({
        title: "Error",
        description: "Error al cargar las mesas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateItemQuantity = async (tabId: string, productId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        const response = await fetch(`/api/tabs/${tabId}/items/${productId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const { tab } = await response.json()
          setTabs(prevTabs => prevTabs.map(t => t.id === tabId ? tab : t))
          toast({
            title: "Producto eliminado",
            description: "Producto eliminado de la mesa"
          })
        }
      } else {
        const response = await fetch(`/api/tabs/${tabId}/items/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: newQuantity })
        })
        
        if (response.ok) {
          const { tab } = await response.json()
          setTabs(prevTabs => prevTabs.map(t => t.id === tabId ? tab : t))
        }
      }
    } catch (error) {
      console.error('Error updating item quantity:', error)
      toast({
        title: "Error",
        description: "Error al actualizar la cantidad",
        variant: "destructive"
      })
    }
  }

  const handleCreateTab = async () => {
    if (!newTabName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la mesa",
        variant: "destructive"
      })
      return
    }

    // Verificar si ya existe una mesa con el mismo nombre
    const tableExists = tabs.some(tab => tab.name.toLowerCase() === newTabName.trim().toLowerCase());
    if (tableExists) {
      setNameError("Ya existe una mesa con este nombre");
      return;
    }

    try {
      setNameError(""); // Limpiar error previo
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newTabName.trim() })
      })

      if (response.ok) {
        const { tab } = await response.json()
        setTabs([...tabs, tab])
        setNewTabName("Mesa")
        toast({
          title: "Mesa creada",
          description: `Mesa "${tab.name}" creada exitosamente`
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear la mesa')
      }
    } catch (error) {
      console.error('Error creating tab:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la mesa",
        variant: "destructive"
      })
    }
  }

  const handleCloseTab = async (tabId: string) => {
    try {
      const response = await fetch(`/api/tabs/${tabId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTabs(tabs.filter(tab => tab.id !== tabId))
        if (activeTab === tabId) {
          setActiveTab(null)
        }
        toast({
          title: "Mesa cerrada",
          description: "Mesa cerrada exitosamente"
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al cerrar la mesa')
      }
    } catch (error) {
      console.error('Error closing tab:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cerrar la mesa",
        variant: "destructive"
      })
    }
  }

  const handleEditTabName = (tab: Tab) => {
    setEditingTabId(tab.id)
    setEditingTabName(tab.name)
  }

  const updateTabName = async () => {
    if (!editingTabId || !editingTabName.trim()) {
      setEditingTabId(null)
      return
    }

    try {
      const response = await fetch(`/api/tabs/${editingTabId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editingTabName.trim() })
      })

      if (response.ok) {
        const { tab } = await response.json()
        setTabs(tabs.map(t => t.id === editingTabId ? tab : t))
        toast({
          title: "Mesa actualizada",
          description: `Nombre de mesa actualizado a "${tab.name}"`
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar el nombre de la mesa')
      }
    } catch (error) {
      console.error('Error updating tab name:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la mesa",
        variant: "destructive"
      })
    }
    setEditingTabId(null)
  }

  const cancelEditTabName = () => {
      setEditingTabId(null)
      setEditingTabName("")
    }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateTab()
    }
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(activeTab === tabId ? null : tabId)
  }

  const getTabTotal = (tab: Tab) => {
    if (tab.total) return tab.total
    return tab.items.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0).toFixed(2)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mesas abiertas</h2>
        <div className="flex flex-col items-end">
          <div className="flex space-x-2">
            <Input
              placeholder="Nueva mesa..."
              value={newTabName}
              onChange={(e) => {
                setNewTabName(e.target.value);
                setNameError("");
              }}
              onKeyDown={handleKeyDown}
              className="w-40"
            />
            <Button onClick={handleCreateTab} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Mesa
            </Button>
          </div>
          {nameError && (
            <span className="text-xs text-red-500 mt-1">{nameError}</span>
          )}
        </div>
      </div>

          {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p>Cargando mesas...</p>
        </div>
          ) : tabs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center flex-col">
          <p className="text-gray-500 mb-2">No hay mesas abiertas</p>
          <p className="text-sm text-gray-400">Usa el botón "Nueva Mesa" para crear una</p>
        </div>
          ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`border rounded-lg p-4 cursor-pointer transition-shadow hover:shadow-md ${activeTab === tab.id ? 'bg-gray-50 border-blue-500' : ''}`}
                onClick={() => handleTabClick(tab.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  {editingTabId === tab.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editingTabName}
                        onChange={(e) => setEditingTabName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateTabName()}
                        autoFocus
                        className="w-32"
                      />
                      <Button size="icon" variant="ghost" onClick={updateTabName}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEditTabName}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium">{tab.name}</h3>
                      <div className="flex items-center space-x-2">
                    <Button
                          size="icon" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditTabName(tab)
                      }}
                    >
                          <Edit2 className="h-4 w-4" />
                    </Button>
                  <Button
                          size="icon" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCloseTab(tab.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {tab.items.length} {tab.items.length === 1 ? 'producto' : 'productos'}
                </div>
                <div className="font-semibold mt-2">
                  ${getTabTotal(tab)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab && (
        <div className="mt-4">
          <TabDetail 
            tab={tabs.find(tab => tab.id === activeTab)!} 
            onUpdateQuantity={updateItemQuantity}
            onCloseTab={() => {
              handleCloseTab(activeTab)
            }}
          />
          </div>
        )}
    </div>
  )
}
