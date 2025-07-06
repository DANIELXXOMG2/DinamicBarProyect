'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Table, type TableGroup } from '@/lib/services/tables';

interface AddTableDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onTableAdded: (table: Table) => void;
  readonly tableGroups: TableGroup[];
  readonly allTables: Table[];
}

export function AddTableDialog({
  isOpen,
  onClose,
  onTableAdded,
  tableGroups,
  allTables,
}: AddTableDialogProps) {
  const [tableName, setTableName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setTableName(newName);
    if (allTables.some((table) => table.name === newName.trim())) {
      setNameError('Ya existe una mesa con este nombre.');
    } else {
      setNameError(null);
    }
  };

  const handleSubmit = async () => {
    if (!tableName.trim() || !selectedGroup) {
      toast.error('Por favor, complete todos los campos');
      return;
    }

    if (nameError) {
      toast.error(nameError);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tableName,
          tableGroupId: selectedGroup,
        }),
      });

      if (response.ok) {
        const newTable = await response.json();
        toast.success('Mesa agregada exitosamente');
        onTableAdded(newTable);
        setTableName('');
        setSelectedGroup(undefined);
        onClose();
      } else {
        toast.error('Error al agregar la mesa');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al agregar la mesa');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Mesa</DialogTitle>
          <DialogDescription>
            Ingrese los detalles de la nueva mesa.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                value={tableName}
                onChange={handleNameChange}
                className={`${nameError ? 'border-red-500' : ''}`}
                placeholder="Ej: Mesa 10"
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-500">{nameError}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group" className="text-right">
              Grupo
            </Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccione un grupo" />
              </SelectTrigger>
              <SelectContent id="group">
                {tableGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Mesa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
