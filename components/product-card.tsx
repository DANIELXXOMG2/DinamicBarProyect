'use client';

import { useState } from 'react';

import { Minus, Plus, ShoppingCart, Package, PlusSquare } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

interface ProductCardProperties {
  readonly id: string;
  readonly title: string;
  readonly salePrice: number;
  readonly stock: number;
  readonly type: 'Alc' | 'NoAlc';
  readonly image?: string;
  readonly onAddToTable?: (productId: string, quantity: number) => void;
  readonly canAddToTable?: boolean;
}

export function ProductCard({
  id,
  title,
  salePrice,
  stock,
  type,
  image,
  onAddToTable,
  canAddToTable = false,
}: ProductCardProperties) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const handleAdd = () => {
    if (stock >= quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleRemove = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToTable = () => {
    if (onAddToTable && canAddToTable && stock >= quantity) {
      onAddToTable(id, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  };

  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div
      className={`flex h-full flex-col rounded-lg border p-4 transition-all duration-200 ${
        isOutOfStock ? 'bg-gray-100 opacity-50' : ''
      }`}
    >
      <div className="mb-3 flex items-start">
        {/* Imagen del producto */}
        <button
          type="button"
          className="mr-3 size-16 shrink-0 overflow-hidden rounded-lg border bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {image && !imageError ? (
            <Image
              src={image}
              alt={title}
              width={64}
              height={64}
              className="size-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Package className="size-6 text-gray-400" />
            </div>
          )}
        </button>

        {/* Información del producto */}
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <div className="flex items-center gap-1" role="status">
              <span
                className={`size-2 rounded-full ${
                  type === 'Alc' ? 'bg-red-500' : 'bg-green-500'
                }`}
              ></span>
              <span className="text-xs text-gray-500">{type}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">
              ${salePrice.toFixed(2)}
            </span>
            <div className="flex items-center gap-2" role="status">
              <span
                className={`text-xs ${(() => {
                  if (isOutOfStock) return 'text-red-500';
                  if (isLowStock) return 'text-orange-500';
                  return 'text-gray-500';
                })()}`}
              >
                Stock: {stock}
                {isOutOfStock && ' (Agotado)'}
                {isLowStock && !isOutOfStock && ' (Poco)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de cantidad y agregar */}
      <div className="mt-auto flex items-center justify-between">
        {/* Selector de cantidad */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            onClick={handleRemove}
            disabled={quantity <= 1 || isOutOfStock}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-6 text-center text-sm font-medium">
            {quantity}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            onClick={handleAdd}
            disabled={stock <= quantity || isOutOfStock}
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            onClick={() => {
              if (stock >= quantity + 2) {
                setQuantity(quantity + 2);
              } else if (stock > quantity) {
                setQuantity(stock);
              }
            }}
            disabled={stock <= quantity || isOutOfStock}
            title="Añadir dos unidades"
          >
            <PlusSquare className="size-4" />
          </Button>
        </div>

        {/* Botón agregar a mesa */}
        <Button
          onClick={handleAddToTable}
          disabled={!canAddToTable || isOutOfStock || stock < quantity}
          className="h-9 bg-blue-500 px-3 text-white hover:bg-blue-600"
          size="sm"
        >
          <ShoppingCart className="mr-1 size-4" />
          Agregar
        </Button>
      </div>
    </div>
  );
}
