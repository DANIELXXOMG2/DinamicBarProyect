import {
  Plus,
  Minus,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';
import Image from 'next/image';

import { Product } from '../types/index';
import { EditableCell } from './editable-cell';
import { useToast } from '@/components/ui/use-toast';
import {
  ProductUtils as ProductUtilities,
  FormatUtils as FormatUtilities,
} from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSortableData } from '../hooks/use-sortable-data';

interface ProductsTableProperties {
  readonly products: readonly Product[];
  readonly loading: boolean;
  readonly onStockChange: (id: string, change: number) => void;
  readonly onEditImage: (productId: string, currentImage?: string) => void;
  readonly onDeleteImage: (productId: string) => void;
  readonly hasFilters: boolean;
}

async function updateProductField(
  productId: string,
  field: string,
  value: string | number
): Promise<void> {
  const response = await fetch(`/api/inventory/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ [field]: value }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update product');
  }
}

export function ProductsTable({
  products,
  loading,
  onStockChange,
  onEditImage,
  onDeleteImage,
  hasFilters,
}: ProductsTableProperties) {
  const { toast } = useToast();
  const { sortedProducts, requestSort } = useSortableData(products);

  const noProductsMessage = hasFilters
    ? 'No hay productos que coincidan con los filtros'
    : 'No hay productos en el inventario';
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventario Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('name')}>
                  Producto
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('stock')}>
                  Stock
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>Stock Mín.</TableHead>
              <TableHead>Precio Compra</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort('totalValue')}
                >
                  Valor Total
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort('salePrice')}
                >
                  Precio Venta
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center">
                  Cargando productos...
                </TableCell>
              </TableRow>
            )}
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-8 text-center text-gray-500"
                >
                  {noProductsMessage}
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              sortedProducts.length > 0 &&
              sortedProducts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="group relative">
                      {item.image ? (
                        <>
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="rounded-md border object-cover"
                            onError={(event) => {
                              event.currentTarget.srcset =
                                '/placeholder-product.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 text-white hover:bg-white/20"
                              onClick={() =>
                                onEditImage(item.id, item.image || undefined)
                              }
                            >
                              <Edit className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 text-white hover:bg-white/20"
                              onClick={() => onDeleteImage(item.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="flex size-12 cursor-pointer items-center justify-center rounded-md border bg-gray-200 transition-colors hover:bg-gray-300"
                          onClick={() => onEditImage(item.id)}
                        >
                          <Package className="size-6 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <EditableCell
                      initialValue={item.name}
                      onSave={async (newValue) => {
                        try {
                          await updateProductField(item.id, 'name', newValue);
                          toast({
                            description: 'Nombre del producto actualizado.',
                          });
                        } catch {
                          toast({
                            variant: 'destructive',
                            description: 'No se pudo actualizar el nombre.',
                          });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      initialValue={item.category.name}
                      onSave={async (newValue) => {
                        try {
                          await updateProductField(
                            item.id,
                            'category',
                            newValue
                          );
                          toast({ description: 'Categoría actualizada.' });
                        } catch {
                          toast({
                            variant: 'destructive',
                            description: 'No se pudo actualizar la categoría.',
                          });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        item.stock <= (item.minStock || 0)
                          ? 'font-bold text-red-600'
                          : ''
                      }
                    >
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>{item.minStock || 0}</TableCell>
                  <TableCell>
                    <EditableCell
                      initialValue={String(item.purchasePrice)}
                      onSave={async (newValue) => {
                        try {
                          await updateProductField(
                            item.id,
                            'purchasePrice',
                            Number(newValue)
                          );
                          toast({
                            description: 'Precio de compra actualizado.',
                          });
                        } catch {
                          toast({
                            variant: 'destructive',
                            description:
                              'No se pudo actualizar el precio de compra.',
                          });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {FormatUtilities.formatCurrency(
                      ProductUtilities.getTotalValue(item)
                    )}
                  </TableCell>
                  <TableCell>
                    {ProductUtilities.getStockStatus(item) === 'low' ? (
                      <span className="flex items-center gap-1 font-medium text-red-600">
                        <AlertTriangle className="size-4" />
                        Bajo
                      </span>
                    ) : (
                      <span className="font-medium text-green-600">Normal</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      initialValue={String(item.salePrice)}
                      onSave={async (newValue) => {
                        try {
                          await updateProductField(
                            item.id,
                            'salePrice',
                            Number(newValue)
                          );
                          toast({
                            description: 'Precio de venta actualizado.',
                          });
                        } catch {
                          toast({
                            variant: 'destructive',
                            description:
                              'No se pudo actualizar el precio de venta.',
                          });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => onStockChange(item.id, -1)}
                        disabled={item.stock <= 0}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => onStockChange(item.id, 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
