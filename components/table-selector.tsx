"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Users, Clock, Edit2, Check, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Tab {
  id: string
  name: string
  isActive: boolean
  total: number
  createdAt: string
  items: any[]
}

interface TableSelectorProps {
  onSelect: (tableId: string, tableName: string) => void
  onClose: () => void
}

export function TableSelector({ onSelect, onClose }: TableSelectorProps) {
  const [tables, setTables] = useState<Tab[]>([])
  const [loading, setLoading] = useState(true)
  const [newTableName, setNewTableName] = useState("")
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tabs')
      if (response.ok) {
        const { tabs } = await response.json()
        setTables(tabs)
      } else {
        toast({
          title: "Error",
          description: "Error al cargar las mesas.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading tables:', error)
      toast({
        title: "Error",
        description: "Error al cargar las mesas.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createNewTable = async () => {
    if (!newTableName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la mesa.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTableName.trim()
        })
      })

      if (response.ok) {
        const { tab } = await response.json()
        setTables([...tables, tab])
        setNewTableName("")
        toast({
          title: "Mesa creada",
          description: `Mesa "${tab.name}" creada exitosamente.`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la mesa')
      }
    } catch (error) {
      console.error('Error creating table:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la mesa.",
        variant: "destructive"
      })
    }
  }

  const updateTableName = async (tableId: string, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la mesa no puede estar vacío.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/tabs/${tableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim()
        })
      })

      if (response.ok) {
        const { tab } = await response.json()
        setTables(tables.map(t => t.id === tableId ? tab : t))
        setEditingTable(null)
        setEditName("")
        toast({
          title: "Mesa actualizada",
          description: `Nombre de mesa actualizado a "${tab.name}".`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la mesa')
      }
    } catch (error) {
      console.error('Error updating table:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la mesa.",
        variant: "destructive"
      })
    }
  }

  const startEditing = (table: Tab) => {
    setEditingTable(table.id)
    setEditName(table.name)
  }

  const cancelEditing = () => {
    setEditingTable(null)
    setEditName("")
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seleccionar Mesa
          </DialogTitle>
        </DialogHeader>

        {/* Crear nueva mesa */}
        <div className="border-b pb-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Crear nueva mesa</h3>
          <div className="flex gap-2">
            <Input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Nombre de la mesa..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createNewTable()
                }
              }}
            />
            <Button onClick={createNewTable} className="flex-shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Crear
            </Button>
          </div>
        </div>

        {/* Lista de mesas */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Mesas disponibles</h3>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando mesas...
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay mesas disponibles. Crea una nueva mesa.
            </div>
          ) : (
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    {editingTable === table.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateTableName(table.id, editName)
                            } else if (e.key === 'Escape') {
                              cancelEditing()
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTableName(table.id, editName)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{table.name}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(table)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(table.createdAt)}
                      </span>
                      <span>{table.items?.length || 0} productos</span>
                      <span className="font-medium text-green-600">
                        ${table.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {editingTable !== table.id && (
                    <Button
                      onClick={() => onSelect(table.id, table.name)}
                      className="ml-4"
                    >
                      Seleccionar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}