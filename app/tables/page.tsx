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

  if (!activeGroup || !activeTable || !overGroup || !overTable) return groups;

  if (activeGroup.id === overGroup.id) {
    const activeTableIndex = activeGroup.tables.findIndex(
      (t) => t.id === activeId
    );
    const overTableIndex = overGroup.tables.findIndex(
      (t) => t.id === overTable.id
    );
    if (activeTableIndex === overTableIndex) return null;

    const newTables = [...activeGroup.tables];
    const [removed] = newTables.splice(activeTableIndex, 1);
    newTables.splice(overTableIndex, 0, removed);
    activeGroup.tables = newTables;
  } else {
    const activeTableIndex = activeGroup.tables.findIndex(
      (t) => t.id === activeId
    );
    const overTableIndex = overGroup.tables.findIndex(
      (t) => t.id === overTable.id
    );

    const newActiveTables = [...activeGroup.tables];
    const newOverTables = [...overGroup.tables];

    const [active] = newActiveTables.splice(activeTableIndex, 1);
    const [over] = newOverTables.splice(overTableIndex, 1);

    newActiveTables.splice(activeTableIndex, 0, over);
    newOverTables.splice(overTableIndex, 0, active);

    activeGroup.tables = newActiveTables;
    overGroup.tables = newOverTables;

    updateTableGroup(active.id, overGroup.id);
    updateTableGroup(over.id, activeGroup.id);
  }

  return groups;
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
  const targetGroup = groups.find((g) => g.id === targetGroupId);

  if (!activeGroup || !activeTable || !targetGroup) return groups;

  const newActiveTables = activeGroup.tables.filter((t) => t.id !== activeId);
  const newTargetTables = [...targetGroup.tables, activeTable];

  activeGroup.tables = newActiveTables;
  targetGroup.tables = newTargetTables;

  updateTableGroup(activeTable.id, targetGroup.id);

  return groups;
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
      />
      <AddTableGroupDialog
        isOpen={isAddGroupDialogOpen}
        onClose={() => setIsAddGroupDialogOpen(false)}
        onGroupAdded={handleGroupAdded}
      />
    </div>
  );
}
