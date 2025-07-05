'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SplitBillDialog } from '@/components/tables/split-bill-dialog';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type Table,
  type TabItem,
  type Product,
  PaymentMethod,
} from '@prisma/client';

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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState<number | string>('');

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
        if (data.items && data.items.length > 0) {
          const productItems = data.items.map((item) => ({
            tabItemId: item.id,
            productId: item.product.id,
            name: item.product.name,
            price: item.product.salePrice ?? 0,
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

      fetchTableData();
    } catch (error_) {
      if (error_ instanceof Error) {
        setError(error_.message);
      }
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      setAdminPassword('');
      setQuantityToDelete('');
    }
  };

  const handleSplitSubmit = async (
    selectedItems: readonly (ProductOnTable & { splitQuantity: number })[]
  ) => {
    try {
      const response = await fetch(`/api/tables/${id}/split`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemsToPay: selectedItems.map((item) => ({
            tabItemId: item.tabItemId,
            quantity: item.splitQuantity,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pago parcial');
      }

      toast.success('Pago parcial procesado correctamente');
      fetchTableData(); // Recargar datos para reflejar los cambios
    } catch (error_) {
      if (error_ instanceof Error) {
        setError(error_.message);
        toast.error(error_.message);
      }
    }
  };

  const handleProcessSale = async () => {
    setError(null); // Reset error on new attempt
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId: id,
          paymentMethod,
          cashReceived:
            paymentMethod === 'CASH' ? Number(cashReceived) : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Error al procesar la venta';
        setError(errorMessage);
        return;
      }

      if (result.saleSkipped) {
        toast.warning('Venta no registrada', {
          description: result.message,
        });
      } else {
        toast.success('Venta procesada', {
          description: 'La venta se ha procesado correctamente.',
        });
      }
      // Actualizar los datos de la mesa para reflejar el cierre
      await fetchTableData();

      setIsPaymentDialogOpen(false);
      setCashReceived('');
    } catch (error_) {
      if (error_ instanceof Error) {
        setError(error_.message);
      }
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

  if (error && !isPaymentDialogOpen) {
    // El manejo de errores ahora se hace arriba, así que podemos simplemente renderizar el resto de la página.
  }

  if (!table) {
    return <div>Table not found.</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mesa: {table?.name}</h1>
        <Link href="/tables" passHref>
          <Button variant="ghost" size="icon">
            <X className="size-6" />
          </Button>
        </Link>
      </div>

      {error && (
        <div
          className="relative mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

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

      <div className="border-t pt-4">
        <div className="mb-4 flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>${total.toLocaleString()}</span>
        </div>
        {table.isActive ? (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline">Precuenta</Button>
            <SplitBillDialog
              details={products}
              onSplitSubmit={handleSplitSubmit}
            />
            <Button
              onClick={() => {
                setError(null);
                setIsPaymentDialogOpen(true);
              }}
            >
              Cerrar Cuenta
            </Button>
          </div>
        ) : (
          <div className="text-center text-lg font-semibold text-gray-500">
            Mesa cerrada.
          </div>
        )}
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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">
              Procesar Pago
            </AlertDialogTitle>
            <AlertDialogDescription>
              Completa los detalles para finalizar la venta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total a pagar</p>
              <p className="text-4xl font-bold tracking-tight">
                ${total.toLocaleString()}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <Select
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
                defaultValue={paymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Efectivo</SelectItem>
                  <SelectItem value="CARD">Tarjeta</SelectItem>
                  <SelectItem value="TRANSFER">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentMethod === 'CASH' && (
              <div className="grid gap-2">
                <Label htmlFor="cashReceived">Efectivo Recibido</Label>
                <Input
                  id="cashReceived"
                  type="number"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
              </div>
            )}
            {paymentMethod === 'CASH' &&
              Number(cashReceived) > 0 &&
              Number(cashReceived) >= total && (
                <div className="flex items-center justify-between rounded-lg bg-gray-100 p-3">
                  <p className="font-medium">Cambio a devolver:</p>
                  <p className="font-bold">
                    $ {(Number(cashReceived) - total).toLocaleString()}
                  </p>
                </div>
              )}
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcessSale}
              disabled={
                paymentMethod === 'CASH' && Number(cashReceived) < total
              }
            >
              Pagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
