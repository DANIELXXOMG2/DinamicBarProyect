"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Edit2, Check } from "lucide-react"
import { TabDetail } from "./tab-detail"
import { toast } from "@/hooks/use-toast"

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

interface Tab {
  id: string
  name: string
  items: TabItem[]
  isActive: boolean
}

export function TableManagement() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [loading, setLoading] = useState(true)
  const [newTabName, setNewTabName] = useState("")
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

  const addItemToTab = (tabId: string, item: { title: string; price: number }) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => {
        if (tab.id === tabId) {
          const existingItem = tab.items.find(i => i.product.name === item.title)
          if (existingItem) {
            return {
              ...tab,
              items: tab.items.map(i => 
                i.product.name === item.title 
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              )
            }
          } else {
            return {
              ...tab,
              items: [...tab.items, { ...item, quantity: 1 }]
            }
          }
        }
        return tab
      })
    )
  }

  const updateItemQuantity = async (tabId: string, itemTitle: string, newQuantity: number) => {
    try {
      const tab = tabs.find(t => t.id === tabId)
      if (!tab) return
      
      const item = tab.items.find(i => i.product.name === itemTitle)
      if (!item) return
      
      if (newQuantity <= 0) {
        const response = await fetch(`/api/tabs/${tabId}/items/${item.productId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setTabs(tabs.map(t => 
            t.id === tabId 
              ? { ...t, items: t.items.filter(i => i.product.name !== itemTitle) } 
              : t
          ))
        }
      } else {
        const response = await fetch(`/api/tabs/${tabId}/items/${item.productId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: newQuantity })
        })
        
        if (response.ok) {
          setTabs(tabs.map(t => 
            t.id === tabId 
              ? { 
                  ...t, 
                  items: t.items.map(i => 
                    i.product.name === itemTitle 
                      ? { ...i, quantity: newQuantity }
                      : i
                  ) 
                } 
              : t
          ))
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

    try {
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
        setNewTabName("")
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
        method: 'PATCH',
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
        description: error instanceof Error ? error.message : "Error al actualizar el nombre de la mesa",
        variant: "destructive"
      })
    } finally {
      setEditingTabId(null)
      setEditingTabName("")
    }
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="w-full md:w-64 border-r p-4">
        <div className="flex items-center gap-2 mb-4">
          <Input
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            placeholder="Nombre de mesa"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateTab()
              }
            }}
          />
          <Button size="icon" onClick={handleCreateTab}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Cargando mesas...</div>
          ) : tabs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No hay mesas activas</div>
          ) : (
            tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${
                  activeTab === tab.id ? "bg-green-50 border-green-500" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex-1">
                  {editingTabId === tab.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingTabName}
                        onChange={(e) => setEditingTabName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateTabName()
                          if (e.key === 'Escape') setEditingTabId(null)
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={updateTabName}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs text-gray-500">{tab.items.length} productos</div>
                    </>
                  )}
                </div>
                <div className="flex">
                  {!editingTabId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditTabName(tab)
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCloseTab(tab.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1">
        {activeTab ? (
          <TabDetail 
            tab={tabs.find((t) => t.id === activeTab)!} 
            onUpdateQuantity={(itemTitle, newQuantity) => updateItemQuantity(activeTab, itemTitle, newQuantity)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Selecciona una mesa o crea una nueva
          </div>
        )}
      </div>
    </div>
  )
}
