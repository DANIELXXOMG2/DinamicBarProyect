'use client';

import { useState } from 'react';

import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CompactItemCardProperties {
  readonly title: string;
  readonly price: number;
  readonly stock: number;
  readonly type: 'Alc' | 'NoAlc';
  readonly onAdd?: () => void;
  readonly onRemove?: () => void;
}

export function CompactItemCard({
  title,
  price,
  stock,
  type,
  onAdd,
  onRemove,
}: CompactItemCardProperties) {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = () => {
    if (stock > quantity) {
      setQuantity(quantity + 1);
      if (onAdd) onAdd();
    }
  };

  const handleRemove = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
      if (onRemove) onRemove();
    }
  };

  return (
    <div className="flex items-center justify-between rounded-md border p-2 focus-within:ring-2 focus-within:ring-green-500 hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="flex items-center gap-1">
            <span
              className={`size-2 rounded-full ${type === 'Alc' ? 'bg-red-500' : 'bg-green-500'}`}
            ></span>
            <span className="text-xs text-gray-500">{type}</span>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-bold text-green-600">${price.toFixed(2)}</span>
          <span className="text-xs text-gray-500">Stock: {stock}</span>
        </div>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-6 rounded-full"
          onClick={handleRemove}
          disabled={quantity === 0}
        >
          <Minus className="size-3" />
        </Button>
        <span className="w-4 text-center text-sm font-medium">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="size-6 rounded-full"
          onClick={handleAdd}
          disabled={stock <= quantity}
        >
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  );
}
