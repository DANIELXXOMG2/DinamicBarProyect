'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { type Table } from '@/lib/services/tables';
import { useRouter } from 'next/navigation';

interface DraggableTableProps {
  readonly table: Table;
}

export function DraggableTable({ table }: DraggableTableProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.id,
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
      className="flex size-full cursor-grab items-center justify-center rounded-lg bg-white p-4 shadow-md"
    >
      {table.name}
    </div>
  );
}
