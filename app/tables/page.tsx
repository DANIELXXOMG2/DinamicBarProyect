'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { AddTableDialog } from '@/components/tables/add-table-dialog';
import { AddTableGroupDialog } from '@/components/tables/add-table-group-dialog';
import { TableGroup } from '@/components/tables/table-group';
import {
  type TableGroup as TableGroupType,
  type Table,
} from '@/lib/services/tables';

const updateTableGroup = (tableId: string, groupId: string) => {
  return fetch(`/api/tables/${tableId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tableGroupId: groupId }),
  }).catch(console.error);
};

const findGroupAndTableById = (groups: TableGroupType[], tableId: string) => {
  for (const group of groups) {
    const table = group.tables.find((t) => t.id === tableId);
    if (table) {
      return { group, table };
    }
  }
  return { group: null, table: null };
};

const findGroupAndTableByOverId = (
  groups: TableGroupType[],
  overId: string
) => {
  for (const group of groups) {
    const table = group.tables.find((t) => `${group.id}-${t.id}` === overId);
    if (table) {
      return { group, table };
    }
  }
  return { group: null, table: null };
};

const handleTableSwap = (
  groups: TableGroupType[],
  activeId: string,
  overId: string
) => {
  const { group: activeGroup, table: activeTable } = findGroupAndTableById(
    groups,
    activeId
  );
  const { group: overGroup, table: overTable } = findGroupAndTableByOverId(
    groups,
    overId
  );

  if (!activeGroup || !activeTable || !overGroup || !overTable) return null;

  const newGroups = groups.map((group) => ({
    ...group,
    tables: [...group.tables],
  }));

  const newActiveGroup = newGroups.find((g) => g.id === activeGroup.id);
  const newOverGroup = newGroups.find((g) => g.id === overGroup.id);

  if (!newActiveGroup || !newOverGroup) return null;

  const activeTableIndex = newActiveGroup.tables.findIndex(
    (t) => t.id === activeId
  );
  const overTableIndex = newOverGroup.tables.findIndex(
    (t) => t.id === overTable.id
  );

  if (activeGroup.id === overGroup.id) {
    if (activeTableIndex === overTableIndex) return null;
    const [removed] = newActiveGroup.tables.splice(activeTableIndex, 1);
    newActiveGroup.tables.splice(overTableIndex, 0, removed);
  } else {
    const [active] = newActiveGroup.tables.splice(activeTableIndex, 1);
    const [over] = newOverGroup.tables.splice(overTableIndex, 1);

    newActiveGroup.tables.splice(activeTableIndex, 0, over);
    newOverGroup.tables.splice(overTableIndex, 0, active);

    updateTableGroup(active.id, overGroup.id);
    updateTableGroup(over.id, activeGroup.id);
  }

  return newGroups;
};

const handleMoveToEmptySlot = (
  groups: TableGroupType[],
  activeId: string,
  overId: string
) => {
  const { group: activeGroup, table: activeTable } = findGroupAndTableById(
    groups,
    activeId
  );
  const targetGroupId = overId.split('-')[1];

  if (!activeGroup || !activeTable || !targetGroupId) return null;

  const newGroups = groups.map((group) => ({
    ...group,
    tables: [...group.tables],
  }));

  const newActiveGroup = newGroups.find((g) => g.id === activeGroup.id);
  const newTargetGroup = newGroups.find((g) => g.id === targetGroupId);

  if (!newActiveGroup || !newTargetGroup) return null;

  const activeTableIndex = newActiveGroup.tables.findIndex(
    (t) => t.id === activeId
  );

  const [movedTable] = newActiveGroup.tables.splice(activeTableIndex, 1);
  newTargetGroup.tables.push(movedTable);

  if (activeGroup.id !== targetGroupId) {
    updateTableGroup(movedTable.id, targetGroupId);
  }

  return newGroups;
};

const calculateNewGroupsOnDragEnd = (
  groups: TableGroupType[],
  activeId: string,
  overId: string
): TableGroupType[] | null => {
  const newGroups = structuredClone(groups);
  const overIsTable = !overId.startsWith('empty-');

  if (overIsTable) {
    return handleTableSwap(newGroups, activeId, overId);
  }
  return handleMoveToEmptySlot(newGroups, activeId, overId);
};

export default function TablesPage() {
  const [tableGroups, setTableGroups] = useState<TableGroupType[]>([]);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);

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
    if (newGroups) {
      setTableGroups(newGroups);
    }
  };

  const handleTableAdded = (newTable: Table) => {
    const tableWithItems = { ...newTable, items: [] };
    setTableGroups((prevGroups) => {
      const newGroups = [...prevGroups];
      const groupIndex = newGroups.findIndex(
        (g) => g.id === newTable.tableGroupId
      );
      if (groupIndex === -1) {
        // If group not found, refetch all groups
        fetch('/api/tables')
          .then((res) => res.json())
          .then(setTableGroups)
          .catch(console.error);
      } else {
        // eslint-disable-next-line security/detect-object-injection
        newGroups[groupIndex].tables.push(tableWithItems);
      }
      return newGroups;
    });
    setIsAddTableDialogOpen(false);
  };

  const handleGroupAdded = (newGroup: TableGroupType) => {
    setTableGroups((prevGroups) => [
      ...prevGroups,
      { ...newGroup, tables: [] },
    ]);
    setIsAddGroupDialogOpen(false);
  };

  const handleGroupDeleted = (groupId: string) => {
    setTableGroups((prevGroups) => prevGroups.filter((g) => g.id !== groupId));
  };

  const allTables = tableGroups.flatMap((group) => group.tables);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-2xl font-bold">Mesas</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddGroupDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Agregar Grupo
          </Button>
          <Button onClick={() => setIsAddTableDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Agregar Mesa
          </Button>
        </div>
      </header>
      <DndContext
        onDragEnd={handleDragEnd}
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        collisionDetection={closestCorners}
      >
        <div className="grid flex-1 auto-rows-min gap-x-24 p-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {tableGroups.map((group) => (
            <TableGroup
              key={group.id}
              group={group}
              onGroupDeleted={handleGroupDeleted}
            />
          ))}
        </div>
      </DndContext>
      <AddTableDialog
        isOpen={isAddTableDialogOpen}
        onClose={() => setIsAddTableDialogOpen(false)}
        onTableAdded={handleTableAdded}
        tableGroups={tableGroups}
        allTables={allTables}
      />
      <AddTableGroupDialog
        isOpen={isAddGroupDialogOpen}
        onClose={() => setIsAddGroupDialogOpen(false)}
        onGroupAdded={handleGroupAdded}
      />
    </div>
  );
}
