'use client';

import { useState, useEffect } from 'react';

import { Table } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface TableData {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'OCCUPIED';
  tab: {
    isActive: boolean;
  } | null;
}

interface TableGroupData {
  id: string;
  name: string;
  tables: TableData[];
}

interface TableSelectionDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly onSelectTable: (table: { id: string; name: string }) => void;
}

export function TableSelectionDialog({
  isOpen,
  onOpenChange,
  onSelectTable,
}: TableSelectionDialogProps) {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchTables = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/tables');
          if (response.ok) {
            const tableGroups = (await response.json()) as TableGroupData[];
            const allTables = tableGroups.flatMap((group) => group.tables);
            const tablesWithStatus = allTables.map((table) => ({
              ...table,
              status: (table.tab?.isActive ? 'OCCUPIED' : 'AVAILABLE') as
                | 'AVAILABLE'
                | 'OCCUPIED',
            }));
            setTables(tablesWithStatus);
          } else {
            console.error('Error fetching tables');
          }
        } catch (error) {
          console.error('Error fetching tables:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTables();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Mesa</DialogTitle>
          <DialogDescription>
            Elige una mesa para asignar los productos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="text-center">Cargando mesas...</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {tables.map((table) => (
                <Button
                  key={table.id}
                  variant={
                    table.status === 'OCCUPIED' ? 'destructive' : 'outline'
                  }
                  disabled={table.status === 'OCCUPIED'}
                  onClick={() => onSelectTable(table)}
                  className="flex h-20 flex-col items-center justify-center gap-2"
                >
                  <Table className="size-6" />
                  <span>{table.name}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
