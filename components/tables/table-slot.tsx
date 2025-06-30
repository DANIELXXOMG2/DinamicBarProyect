'use client';

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface TableSlotProps {
  readonly id: string;
  readonly children: ReactNode;
}

export function TableSlot({ id, children }: TableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-24 w-40 rounded-lg border-2 border-dashed ${isOver ? 'border-primary' : 'border-gray-300'} flex items-center justify-center`}
    >
      {children}
    </div>
  );
}
