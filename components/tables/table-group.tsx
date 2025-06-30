'use client';

import { useState } from 'react';
import { DraggableTable } from './draggable-table';
import { type TableGroup as TableGroupType } from '@/lib/services/tables';
import { Pencil } from 'lucide-react';
import { TableSlot } from './table-slot';

interface TableGroupProps {
  readonly group: TableGroupType;
}

const MAX_SLOTS = 6;

export function TableGroup({ group }: TableGroupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.name);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    fetch(`/api/table-groups/${group.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: groupName }),
    });
  };

  const tableSlots = group.tables.map((table) => ({
    ...table,
    slotId: `${group.id}-${table.id}`,
  }));

  const emptySlots = Array.from(
    { length: MAX_SLOTS - tableSlots.length },
    (_, i) => `empty-${group.id}-${i}`
  );

  return (
    <div className="rounded-lg bg-gray-100 p-4">
      <div className="mb-4 flex items-center">
        {isEditing ? (
          <input
            type="text"
            value={groupName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            className="border-b-2 border-gray-400 bg-transparent text-lg font-bold focus:outline-none"
          />
        ) : (
          <h2 className="text-lg font-bold">{groupName}</h2>
        )}
        <button onClick={() => setIsEditing(true)} className="ml-2">
          <Pencil className="size-5 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {tableSlots.map((table) => (
          <TableSlot key={table.slotId} id={table.slotId}>
            <DraggableTable table={table} />
          </TableSlot>
        ))}
        {emptySlots.map((slotId) => (
          <TableSlot key={slotId} id={slotId}>
            <div className="flex size-full items-center justify-center text-gray-400">
              Vacío
            </div>
          </TableSlot>
        ))}
      </div>
    </div>
  );
}
