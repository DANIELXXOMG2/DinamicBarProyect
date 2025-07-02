'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { AddTableDialog } from '@/components/tables/add-table-dialog';
import { TableGroup } from '@/components/tables/table-group';
import {
  type TableGroup as TableGroupType,
  type Table,
} from '@/lib/services/tables';
import { type TableWithItems } from './[id]/page';

const updateTableGroup = (tableId: string, groupId: string) => {
  fetch(`/api/tables/${tableId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tableGroupId: groupId }),
  }).catch(console.error);
};

const calculateNewGroupsOnDragEnd = (
  groups: TableGroupType[],
  activeId: string,
  overId: string
): TableGroupType[] => {
  const newGroups = structuredClone(groups);
  let draggedTable: TableWithItems | undefined;

  // Find and remove the dragged table from its original group
  for (const group of newGroups) {
    const tableIndex = group.tables.findIndex((t) => t.id === activeId);
    if (tableIndex !== -1) {
      draggedTable = group.tables.splice(tableIndex, 1)[0];
      break;
    }
  }

  if (!draggedTable) return groups;

  // Find the target group and add the table
  const targetGroupId = overId.startsWith('empty-')
    ? overId.split('-')[1]
    : (newGroups.find((g) => g.tables.some((t) => `${g.id}-${t.id}` === overId))
        ?.id ?? overId.split('-')[1]);

  if (!targetGroupId) return groups;

  const targetGroup = newGroups.find((g) => g.id === targetGroupId);
  if (targetGroup) {
    targetGroup.tables.push(draggedTable);
    updateTableGroup(draggedTable.id, targetGroupId);
  }

  return newGroups;
};

export default function TablesPage() {
  const [tableGroups, setTableGroups] = useState<TableGroupType[]>([]);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);

  useEffect(() => {
    fetch('/api/tables')
      .then((res) => res.json())
      .then(setTableGroups)
      .catch(console.error);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const newGroups = calculateNewGroupsOnDragEnd(
      tableGroups,
      activeId,
      overId
    );
    setTableGroups(newGroups);
  };

  const handleTableAdded = (newTable: Table) => {
    const tableWithItems = { ...newTable, items: [] };
    setTableGroups((prevGroups) => {
      const newGroups = [...prevGroups];
      const groupIndex = newGroups.findIndex(
        (g) => g.id === newTable.tableGroupId
      );
      if (groupIndex !== -1) {
        // eslint-disable-next-line security/detect-object-injection
        newGroups[groupIndex].tables.push(tableWithItems);
      }
      return newGroups;
    });
    setIsAddTableDialogOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-2xl font-bold">Mesas</h1>
        <Button onClick={() => setIsAddTableDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Agregar Mesa
        </Button>
      </header>
      <DndContext
        onDragEnd={handleDragEnd}
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="grid flex-1 auto-rows-min gap-4 p-4 [grid-template-columns:repeat(auto-fill,minmax(350px,1fr))]">
          {tableGroups.map((group) => (
            <TableGroup key={group.id} group={group} />
          ))}
        </div>
      </DndContext>
      <AddTableDialog
        isOpen={isAddTableDialogOpen}
        onClose={() => setIsAddTableDialogOpen(false)}
        onTableAdded={handleTableAdded}
        tableGroups={tableGroups}
      />
    </div>
  );
}
