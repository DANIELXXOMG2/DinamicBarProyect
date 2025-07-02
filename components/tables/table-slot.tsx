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
      className={`relative flex size-28 items-center justify-center rounded-full border-2 border-dashed ${isOver ? 'border-primary' : 'border-gray-300'}`}
    >
      {children}
    </div>
  );
}
