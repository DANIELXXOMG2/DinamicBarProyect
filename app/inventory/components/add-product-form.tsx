import { useState } from 'react';
import Image from 'next/image';

import { Category, NewProduct } from '../types/index';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronDown,
  ChevronUp,
  Package,
  Tag,
  Plus,
  Minus,
  DollarSign,
} from 'lucide-react';
import { useProductForm } from '../hooks/use-product-form';

interface AddProductFormProperties {
  readonly categories: readonly Category[];
  readonly onAddProduct: (
    product: NewProduct,
    imageFile?: File
  ) => Promise<void>;
  readonly saving: boolean;
}

export function AddProductForm({
  categories,
  onAddProduct,
  saving,
}: AddProductFormProperties) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const {
    newItem,
    imageMethod,
    previewUrl,
    handleInputChange,
    handleFileChange,
    handleImageUrlChange,
    handleSubmit,
  } = useProductForm(categories, onAddProduct);

  return (
    <Card className="mb-6">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Añadir Nuevo Producto</CardTitle>
            <CardDescription>Agrega productos a tu inventario</CardDescription>
          </div>
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
            {/* Columna de campos de formulario */}
            <div className="space-y-6 md:col-span-2">
              {/* Nombre del producto */}
              <div>
                <Label htmlFor="product-name">Nombre del Producto</Label>
                <div className="relative mt-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nombre del Producto</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Input
                    id="product-name"
                    placeholder="Ej: Coca-cola 350ml"
                    value={newItem.name}
                    onChange={(event) =>
                      handleInputChange('name', event.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Primera fila de inputs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="product-category">Categoría</Label>
                  <div className="relative mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Categoría</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Select
                      value={newItem.categoryId}
                      onValueChange={(value) =>
                        handleInputChange('categoryId', value)
                      }
                    >
                      <SelectTrigger id="product-category" className="pl-10">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="product-min-stock">Stock Mínimo</Label>
                  <div className="relative mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Minus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Stock Mínimo</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input
                      id="product-min-stock"
                      type="number"
                      min="0"
                      placeholder="10"
                      value={newItem.minStock}
                      onChange={(event) =>
                        handleInputChange(
                          'minStock',
                          Number(event.target.value)
                        )
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="product-stock">Stock Actual</Label>
                  <div className="relative mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Stock Actual</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input
                      id="product-stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newItem.stock}
                      onChange={(event) =>
                        handleInputChange('stock', Number(event.target.value))
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Segunda fila de inputs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="product-purchase-price">
                    Precio de Compra
                  </Label>
                  <div className="relative mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Precio de Compra</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input
                      id="product-purchase-price"
                      type="text"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={
                        newItem.purchasePrice === null
                          ? ''
                          : newItem.purchasePrice
                      }
                      onChange={(event) =>
                        handleInputChange('purchasePrice', event.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="product-sale-price">Precio de Venta</Label>
                  <div className="relative mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Precio de Venta</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input
                      id="product-sale-price"
                      type="text"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={
                        newItem.salePrice === null ? '' : newItem.salePrice
                      }
                      onChange={(event) =>
                        handleInputChange('salePrice', event.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna de imagen */}
            <div className="space-y-4">
              <div>
                <p className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Imagen del producto
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative size-24 shrink-0 rounded-lg border-2 border-dashed bg-gray-50">
                    {(previewUrl ||
                      (newItem.image && imageMethod === 'url')) && (
                      <Image
                        src={previewUrl || newItem.image!}
                        alt="Vista previa"
                        layout="fill"
                        className="rounded-lg object-cover"
                        onError={(event) => {
                          const target = event.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div className="grow space-y-2">
                    <Input
                      placeholder="URL de la imagen"
                      value={newItem.image || ''}
                      onChange={(event) =>
                        handleImageUrlChange(event.target.value)
                      }
                    />
                    <Button
                      asChild
                      variant="outline"
                      className="w-full cursor-pointer"
                    >
                      <label htmlFor="file-upload">
                        Seleccionar archivo
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de agregar */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={
                saving ||
                !newItem.name ||
                !newItem.categoryId ||
                !newItem.purchasePrice ||
                !newItem.salePrice
              }
              className="w-full px-6 py-2 md:w-auto"
            >
              {saving ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
