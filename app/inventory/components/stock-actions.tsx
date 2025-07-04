'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface StockActionsProps {
  readonly productId: string;
  readonly onStockChange: (id: string, change: number) => void;
}

export function StockActions({ productId, onStockChange }: StockActionsProps) {
  const [quantity, setQuantity] = useState(1);

  const handleStockUpdate = (change: number) => {
    if (quantity > 0) {
      onStockChange(productId, change);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => handleStockUpdate(-quantity)}
      >
        <Minus className="size-4" />
      </Button>
      <Input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) =>
          setQuantity(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
        }
        className="h-8 w-16 text-center"
      />
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => handleStockUpdate(quantity)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
