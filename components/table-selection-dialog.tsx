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
import { Separator } from './ui/separator';

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

function processTableGroups(groups: TableGroupData[]): TableGroupData[] {
  return groups.map((group) => ({
    ...group,
    tables: group.tables.map((table) => ({
      ...table,
      status: (table.tab?.isActive ? 'OCCUPIED' : 'AVAILABLE') as
        | 'AVAILABLE'
        | 'OCCUPIED',
    })),
  }));
}

export function TableSelectionDialog({
  isOpen,
  onOpenChange,
  onSelectTable,
}: TableSelectionDialogProps) {
  const [tableGroups, setTableGroups] = useState<TableGroupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchTables = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/tables');
          if (response.ok) {
            const fetchedTableGroups =
              (await response.json()) as TableGroupData[];
            setTableGroups(processTableGroups(fetchedTableGroups));
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Mesa</DialogTitle>
          <DialogDescription>
            Elige una mesa para asignar los productos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center">Cargando mesas...</div>
          ) : (
            <div className="space-y-4">
              {tableGroups.map((group, index) => (
                <div key={group.id}>
                  <h3 className="mb-2 text-lg font-semibold">{group.name}</h3>
                  <div className="flex flex-wrap justify-center gap-4 pb-4">
                    {group.tables.map((table) => (
                      <Button
                        key={table.id}
                        variant={
                          table.status === 'OCCUPIED'
                            ? 'destructive'
                            : 'outline'
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
                  {index < tableGroups.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
