'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { type Table, type TabItem, type Product } from '@prisma/client';

interface ProductOnTable {
  tabItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type TableWithItems = Table & {
  items: (TabItem & { product: Product })[];
};

export default function TableDetailsPage() {
  const [table, setTable] = useState<TableWithItems | null>(null);
  const [products, setProducts] = useState<ProductOnTable[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number | string>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductOnTable | null>(
    null
  );
  const [quantityToDelete, setQuantityToDelete] = useState<number | string>('');
  const params = useParams();
  const { id } = params;

  const fetchTableData = useCallback(async () => {
    if (id) {
      try {
        const response = await fetch(`/api/tables/${id as string}`);
        if (!response.ok) {
          throw new Error('Failed to fetch table details');
        }
        const data: TableWithItems = await response.json();
        setTable(data);
        // Simulación de productos de la mesa
        if (data.items && data.items.length > 0) {
          const productItems = data.items.map((item) => ({
            tabItemId: item.id,
            productId: item.product.id,
            name: item.product.name,
            price: item.product.salePrice,
            quantity: item.quantity,
          }));
          setProducts(productItems);

          const initialQuantities: Record<string, number | string> = {};
          for (const product of productItems) {
            initialQuantities[product.tabItemId] = product.quantity;
          }
          setQuantities(initialQuantities);
        } else {
          setProducts([]);
          setQuantities({});
        }
      } catch (error_) {
        if (error_ instanceof Error) {
          setError(error_.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchTableData().catch((error) => {
      setError(error.message);
    });
  }, [fetchTableData]);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const url = new URL(
        `/api/tables/${id}/products/${productToDelete.productId}`,
        globalThis.location.origin
      );
      const qty =
        quantityToDelete === '' ? productToDelete.quantity : quantityToDelete;
      url.searchParams.append('quantityToDelete', String(qty));
      url.searchParams.append('tabItemId', productToDelete.tabItemId);

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el producto');
      }

      // Recargar los datos de la mesa para reflejar la cantidad actualizada
      fetchTableData();
    } catch (error_) {
      if (error_ instanceof Error) {
        setError(error_.message);
      }
    } finally {
      // Reset state and close dialog
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      setAdminPassword('');
      setQuantityToDelete('');
    }
  };

  let total = 0;
  for (const product of products) {
    const quantity = quantities[product.tabItemId];
    const numericQuantity = typeof quantity === 'number' ? quantity : 0;
    total += product.price * numericQuantity;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!table) {
    return <div>Table not found.</div>;
  }

  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="mb-4 text-2xl font-bold">Mesa: {table.name}</h1>

      {/* Lista de productos */}
      <div className="flex-1 overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.tabItemId}
            className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 p-2"
          >
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-gray-500">
                {String(quantities[product.tabItemId] ?? '0')} x ${' '}
                {product.price.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-20 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                {quantities[product.tabItemId]}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setProductToDelete(product);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="size-4 text-red-500" />
              </Button>
              <p className="w-24 text-right font-semibold">
                $
                {(
                  product.price *
                  (typeof quantities[product.tabItemId] === 'number'
                    ? (quantities[product.tabItemId] as number)
                    : 0)
                ).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total y acciones */}
      <div className="border-t pt-4">
        <div className="mb-4 flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>${total.toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline">Precuenta</Button>
          <Button variant="outline">Dividir Cuenta</Button>
          <Button>Cerrar Cuenta</Button>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              Para eliminar{' '}
              <span className="font-bold">{productToDelete?.name}</span>,
              ingresa la cantidad y tu contraseña de administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="number"
              placeholder={`Cantidad a eliminar (máx. ${productToDelete?.quantity})`}
              value={quantityToDelete}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setQuantityToDelete('');
                  return;
                }
                const numValue = Number.parseInt(value, 10);
                if (productToDelete && numValue > productToDelete.quantity) {
                  setQuantityToDelete(productToDelete.quantity);
                } else if (numValue < 0) {
                  setQuantityToDelete(0);
                } else {
                  setQuantityToDelete(numValue);
                }
              }}
            />
            <Input
              type="password"
              placeholder="Contraseña de administrador"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setProductToDelete(null);
                setAdminPassword('');
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
