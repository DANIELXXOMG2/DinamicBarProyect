'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { type TabItem } from '@prisma/client';
import { type Table } from '@/lib/services/tables';
import { useRouter } from 'next/navigation';

interface DraggableTableProps {
  readonly table: Table & { items: TabItem[] };
}

export function DraggableTable({ table }: DraggableTableProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.id,
    data: { isOccupied: table.items.length > 0 },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleTableClick = () => {
    router.push(`/tables/${table.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleTableClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleTableClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={`flex size-full cursor-grab items-center justify-center rounded-lg p-4 shadow-md transition-colors duration-200 ${
        table.items.length > 0
          ? 'bg-red-500 text-white'
          : 'bg-white text-gray-800'
      }`}
    >
      {table.name}
    </div>
  );
}
