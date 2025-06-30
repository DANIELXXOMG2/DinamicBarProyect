'use client';

import { useState, useEffect } from 'react';

import { Plus, Users, Clock, Edit2, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { TabWithItems } from '@/lib/services/tabs';

interface Tab {
  id: string;
  name: string;
  isActive: boolean;
  total: number;
  createdAt: string;
  items: TabWithItems['items'];
}

interface TableSelectorProperties {
  onSelect: (tableId: string, tableName: string) => void;
  onClose: () => void;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function TableSelector({
  onSelect,
  onClose,
}: Readonly<TableSelectorProperties>) {
  const [tables, setTables] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableName, setNewTableName] = useState('');
  const [editingTable, setEditingTable] = useState<string | undefined>();
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tabs');
      if (response.ok) {
        const { tabs } = await response.json();
        setTables(tabs);
      } else {
        toast({
          title: 'Error',
          description: 'Error al cargar las mesas.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading tables:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar las mesas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewTable = async () => {
    const trimmedName = newTableName.trim();

    if (!trimmedName) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un nombre para la mesa.',
        variant: 'destructive',
      });
      return;
    }

    if (tables.some((table) => table.name === trimmedName)) {
      toast({
        title: 'Error',
        description: 'Ya existe una mesa con ese nombre.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTableName.trim(),
        }),
      });

      if (response.ok) {
        const { tab } = await response.json();
        setTables([...tables, tab]);
        setNewTableName('');
        toast({
          title: 'Mesa creada',
          description: `Mesa "${tab.name}" creada exitosamente.`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la mesa');
      }
    } catch (error) {
      console.error('Error creating table:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al crear la mesa.',
        variant: 'destructive',
      });
    }
  };

  const updateTableName = async (tableId: string, newName: string) => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      toast({
        title: 'Error',
        description: 'El nombre de la mesa no puede estar vacío.',
        variant: 'destructive',
      });
      return;
    }

    if (
      tables.some((table) => table.id !== tableId && table.name === trimmedName)
    ) {
      toast({
        title: 'Error',
        description: 'Ya existe una mesa con ese nombre.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/tabs/${tableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim(),
        }),
      });

      if (response.ok) {
        const { tab } = await response.json();
        setTables(tables.map((t) => (t.id === tableId ? tab : t)));
        setEditingTable(undefined);
        setEditName('');
        toast({
          title: 'Mesa actualizada',
          description: `Nombre de mesa actualizado a "${tab.name}".`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la mesa');
      }
    } catch (error) {
      console.error('Error updating table:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar la mesa.',
        variant: 'destructive',
      });
    }
  };

  const startEditing = (table: Tab) => {
    setEditingTable(table.id);
    setEditName(table.name);
  };

  const cancelEditing = () => {
    setEditingTable(undefined);
    setEditName('');
  };

  let tableContent;
  if (loading) {
    tableContent = (
      <div className="py-8 text-center text-gray-500">Cargando mesas...</div>
    );
  } else if (tables.length === 0) {
    tableContent = (
      <div className="py-8 text-center text-gray-500">
        No hay mesas disponibles. Crea una nueva mesa.
      </div>
    );
  } else {
    tableContent = (
      <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto">
        {tables.map((table) => (
          <div
            key={table.id}
            className="flex flex-col rounded-lg border p-3 transition-colors hover:bg-gray-50"
          >
            <div className="space-y-2">
              {editingTable === table.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="h-8 flex-1"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        updateTableName(table.id, editName);
                      } else if (event.key === 'Escape') {
                        cancelEditing();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateTableName(table.id, editName)}
                  >
                    <Check className="size-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    <X className="size-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{table.name}</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(table)}
                    className="size-6 p-0"
                  >
                    <Edit2 className="size-3" />
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatTime(table.createdAt)}
                </span>
                <div className="flex justify-between">
                  <span>{table.items?.length || 0} productos</span>
                  <span className="font-medium text-green-600">
                    ${table.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {editingTable !== table.id && (
                <Button
                  onClick={() => onSelect(table.id, table.name)}
                  className="mt-2 w-full"
                  size="sm"
                >
                  Seleccionar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Seleccionar Mesa
          </DialogTitle>
        </DialogHeader>

        {/* Crear nueva mesa */}
        <div className="mb-4 border-b pb-4">
          <h3 className="mb-2 text-sm font-medium">Crear nueva mesa</h3>
          <div className="flex gap-2">
            <Input
              value={newTableName}
              onChange={(event) => setNewTableName(event.target.value)}
              placeholder="Nombre de la mesa..."
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  createNewTable();
                }
              }}
            />
            <Button onClick={createNewTable} className="shrink-0">
              <Plus className="mr-1 size-4" />
              Crear
            </Button>
          </div>
        </div>

        {/* Lista de mesas */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Mesas disponibles</h3>
          {tableContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
