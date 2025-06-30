'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { DollarSign, X } from 'lucide-react';
import {
  MinusCircle,
  PlusCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CartItem } from './cart-item';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';

// Tipos de métodos de pago
type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'MOBILE_PAYMENT' | 'INVOICE';

// Definir Product
interface Product {
  readonly id: string;
  readonly name: string;
  readonly salePrice: number;
  readonly stock: number;
  readonly type: 'ALCOHOLIC' | 'NON_ALCOHOLIC';
  readonly image?: string;
  readonly category: {
    readonly name: string;
  };
}

// Definir TabItem
interface TabItem {
  readonly id: string;
  readonly tabId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly product: Product;
}

// Definir Tab
interface Tab {
  readonly id: string;
  readonly name: string;
  readonly items: readonly TabItem[];
  readonly isActive: boolean;
  readonly subtotal?: number;
  readonly total?: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

interface TabDetailProperties {
  readonly tab: Tab;
  readonly onUpdateQuantity: (
    tabId: string,
    productId: string,
    newQuantity: number
  ) => void;
  readonly onCloseTab: () => void;
  readonly onMinimize?: () => void;
}

export function TabDetail({
  tab,
  onUpdateQuantity,
  onCloseTab,
  onMinimize,
}: Readonly<TabDetailProperties>) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [splitItems, setSplitItems] = useState<
    (TabItem & { splitQuantity: number })[]
  >([]);
  const [processingSplit, setProcessingSplit] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [splitTotal, setSplitTotal] = useState(0);
  const [remainingTotal, setRemainingTotal] = useState(0);

  const subtotal = tab.items.reduce(
    (accumulator, item) => accumulator + item.product.salePrice * item.quantity,
    0
  );
  const total = subtotal;

  // Para la división de cuenta
  const selectedTotal = tab.items
    .filter((item) => selectedItems[item.id])
    .reduce(
      (accumulator, item) =>
        accumulator + item.product.salePrice * item.quantity,
      0
    );

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((previous) => ({
      ...previous,
      // eslint-disable-next-line security/detect-object-injection
      [itemId]: !previous[itemId],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = tab.items.every((item) => selectedItems[item.id]);

    if (allSelected) {
      // Deseleccionar todos
      setSelectedItems({});
    } else {
      // Seleccionar todos
      const newSelection: Record<string, boolean> = {};
      for (const item of tab.items) {
        newSelection[item.id] = true;
      }
      setSelectedItems(newSelection);
    }
  };

  // Calcular total
  useEffect(() => {
    const total = tab.items.reduce(
      (accumulator, item) =>
        accumulator + item.product.salePrice * item.quantity,
      0
    );
    setRemainingTotal(total);
  }, [tab.items, setRemainingTotal]);

  // Actualizar cantidad a dividir
  const updateSplitQuantity = (id: string, change: number) => {
    setSplitItems((previousItems) => {
      return previousItems.map((item) => {
        if (item.id === id) {
          // Asegurar que la cantidad a dividir está dentro de los límites
          const newSplitQuantity = Math.max(
            0,
            Math.min(item.quantity, item.splitQuantity + change)
          );
          return { ...item, splitQuantity: newSplitQuantity };
        }
        return item;
      });
    });

    // Actualizar el total de la división
    calculateSplitTotal();
  };

  // Calcular total de la división
  const calculateSplitTotal = useCallback(() => {
    const total = splitItems.reduce(
      (accumulator, item) =>
        accumulator + item.product.salePrice * item.splitQuantity,
      0
    );
    setSplitTotal(total);
  }, [splitItems]);

  // Efecto para calcular el total de la división cuando cambian los items
  useEffect(() => {
    calculateSplitTotal();
  }, [splitItems, calculateSplitTotal]);

  // Procesar división de cuenta
  const processSplit = async () => {
    if (splitTotal === 0) {
      toast({
        title: 'Error',
        description:
          'Debes seleccionar al menos un producto para dividir la cuenta',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un método de pago',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessingSplit(true);

      // Crear un nuevo arreglo de items con las cantidades actualizadas
      const updatedItems = tab.items
        .map((item) => {
          const splitItem = splitItems.find((si) => si.id === item.id);
          const splitQuantity = splitItem?.splitQuantity || 0;

          return {
            ...item,
            quantity: item.quantity - splitQuantity,
          };
        })
        .filter((item) => item.quantity > 0); // Eliminar items con cantidad 0

      // Crear un arreglo de items pagados para el registro
      const paidItems = splitItems
        .filter((item) => item.splitQuantity > 0)
        .map((item) => ({
          id: item.id,
          name: item.product.name,
          price: item.product.salePrice,
          quantity: item.splitQuantity,
          categoryId: item.productId,
          categoryName: item.product.name,
        }));

      // Registrar pago parcial en el servidor
      const response = await fetch(`/api/tabs/${tab.id}/split`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paidItems,
          remainingItems: updatedItems,
          paymentMethod,
          splitTotal,
          remainingTotal: remainingTotal - splitTotal,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la división de cuenta');
      }

      // Actualizar los items localmente
      const newItems = updatedItems;
      setSelectedItems({});
      setSheetOpen(false);

      // Mostrar mensaje de éxito
      toast({
        title: 'Pago parcial procesado',
        description: `Se ha procesado el pago de $${splitTotal.toFixed(2)} correctamente`,
      });

      // Cerrar diálogo
      setSplitDialogOpen(false);

      // Si no quedan items, redirigir a la lista de mesas
      if (newItems.length === 0) {
        router.push('/tables');
      }
    } catch (error) {
      console.error('Error processing split:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al procesar la división',
        variant: 'destructive',
      });
    } finally {
      setProcessingSplit(false);
    }
  };

  // Procesar pago completo
  const processPayment = async () => {
    if (!paymentMethod) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un método de pago',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessingPayment(true);

      // Registrar pago completo en el servidor
      const response = await fetch(`/api/tabs/${tab.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod,
          total: remainingTotal,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar el pago');
      }

      // Mostrar mensaje de éxito
      toast({
        title: 'Pago procesado',
        description: `Se ha procesado el pago de $${remainingTotal.toFixed(2)} correctamente`,
      });

      // Cerrar diálogo
      setPaymentDialogOpen(false);

      // Si hay una función onCloseTab, usarla en lugar de redireccionar
      if (onCloseTab) {
        onCloseTab();
      } else {
        // Redirigir a la lista de mesas
        router.push('/tables');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al procesar el pago',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-2 md:p-4">
      <div className="mb-2 flex items-center justify-between md:mb-4">
        <h2 className="text-lg font-bold md:text-xl">{tab.name}</h2>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 md:text-sm">{tab.id}</div>
          {onMinimize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="size-6 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="Cerrar vista de productos"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tab.items.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-gray-500">
            No hay productos en esta mesa
          </div>
        ) : (
          tab.items.map((item) => (
            <div
              key={item.id}
              className="mb-3 flex flex-col items-start gap-2 rounded-md border p-2 sm:flex-row sm:items-center md:mb-4 md:gap-3"
            >
              <div className="w-full sm:w-auto">
                <CartItem
                  title={item.product.name}
                  salePrice={item.product.salePrice}
                  quantity={item.quantity}
                  image="/placeholder.svg?height=64&width=64"
                />
              </div>
              <div className="mt-2 flex items-center gap-2 self-end sm:mt-0 sm:self-auto">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-6"
                  onClick={() =>
                    onUpdateQuantity(tab.id, item.productId, item.quantity - 1)
                  }
                >
                  -
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-6"
                  onClick={() =>
                    onUpdateQuantity(tab.id, item.productId, item.quantity + 1)
                  }
                >
                  +
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 border-t pt-3 md:mt-4 md:pt-4">
        <div className="mb-3 space-y-2 md:mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sub Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {/* Botón de dividir cuenta con Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 text-sm md:gap-2 md:text-base"
              >
                <DollarSign className="size-3 md:size-4" />
                Dividir Cuenta
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Dividir Cuenta - {tab.name}</SheetTitle>
              </SheetHeader>

              <div className="flex items-center justify-between border-b py-3">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {(() => {
                    const allSelected = tab.items.every(
                      (item) => selectedItems[item.id]
                    );
                    return allSelected
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos';
                  })()}
                </Button>
                <div className="text-sm font-medium">
                  Total: ${selectedTotal.toFixed(2)}
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto py-4">
                {tab.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 border-b py-2"
                  >
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={!!selectedItems[item.id]}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                    />
                    <div className="flex flex-1 justify-between">
                      <label
                        htmlFor={`item-${item.id}`}
                        className="cursor-pointer text-sm font-medium"
                      >
                        {item.product.name} ({item.quantity}x)
                      </label>
                      <span className="text-sm font-medium">
                        ${(item.product.salePrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <SheetFooter className="border-t pt-4">
                <Button
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  disabled={!Object.values(selectedItems).some(Boolean)}
                >
                  Procesar Pago (${selectedTotal.toFixed(2)})
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Button
            className="col-span-1 bg-green-600 text-sm text-white hover:bg-green-700 md:col-span-2 md:text-base"
            onClick={() => setPaymentDialogOpen(true)}
          >
            Procesar Pago Completo
          </Button>
        </div>
      </div>

      {/* Diálogo para dividir cuenta */}
      <Dialog open={splitDialogOpen} onOpenChange={setSplitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dividir Cuenta</DialogTitle>
            <DialogDescription>
              Selecciona las unidades que deseas pagar y el método de pago
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 max-h-[60vh] space-y-4 overflow-y-auto">
            {splitItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-gray-500">
                    ${item.product.salePrice.toFixed(2)} x {item.quantity} = $
                    {(item.product.salePrice * item.quantity).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => updateSplitQuantity(item.id, -1)}
                    disabled={item.splitQuantity <= 0}
                  >
                    <MinusCircle className="size-4" />
                  </Button>
                  <div className="w-8 text-center">{item.splitQuantity}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => updateSplitQuantity(item.id, 1)}
                    disabled={item.splitQuantity >= item.quantity}
                  >
                    <PlusCircle className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="my-2 border-y py-2">
            <div className="flex justify-between font-medium">
              <span>Subtotal a pagar:</span>
              <span>${splitTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Resto de la cuenta:</span>
              <span>${(remainingTotal - splitTotal).toFixed(2)}</span>
            </div>
          </div>

          <div className="my-4 space-y-2">
            <Label>Método de Pago</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="CASH" id="cash" />
                <Label
                  htmlFor="cash"
                  className="flex cursor-pointer items-center"
                >
                  <Banknote className="mr-2 size-4" />
                  Efectivo
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="CREDIT_CARD" id="card" />
                <Label
                  htmlFor="card"
                  className="flex cursor-pointer items-center"
                >
                  <CreditCard className="mr-2 size-4" />
                  Tarjeta
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="MOBILE_PAYMENT" id="mobile" />
                <Label
                  htmlFor="mobile"
                  className="flex cursor-pointer items-center"
                >
                  <Smartphone className="mr-2 size-4" />
                  Pago Móvil
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="INVOICE" id="invoice" />
                <Label
                  htmlFor="invoice"
                  className="flex cursor-pointer items-center"
                >
                  <Receipt className="mr-2 size-4" />
                  Factura
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSplitDialogOpen(false)}
              disabled={processingSplit}
            >
              Cancelar
            </Button>
            <Button
              onClick={processSplit}
              disabled={splitTotal === 0 || processingSplit}
            >
              {processingSplit ? 'Procesando...' : 'Procesar Pago Parcial'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para pago completo */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar Cuenta Completa</DialogTitle>
            <DialogDescription>
              Selecciona el método de pago para completar la transacción
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 border-y py-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total a pagar:</span>
              <span>${remainingTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="my-4 space-y-2">
            <Label>Método de Pago</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="CASH" id="cash-full" />
                <Label
                  htmlFor="cash-full"
                  className="flex cursor-pointer items-center"
                >
                  <Banknote className="mr-2 size-4" />
                  Efectivo
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="CREDIT_CARD" id="card-full" />
                <Label
                  htmlFor="card-full"
                  className="flex cursor-pointer items-center"
                >
                  <CreditCard className="mr-2 size-4" />
                  Tarjeta
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="MOBILE_PAYMENT" id="mobile-full" />
                <Label
                  htmlFor="mobile-full"
                  className="flex cursor-pointer items-center"
                >
                  <Smartphone className="mr-2 size-4" />
                  Pago Móvil
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="INVOICE" id="invoice-full" />
                <Label
                  htmlFor="invoice-full"
                  className="flex cursor-pointer items-center"
                >
                  <Receipt className="mr-2 size-4" />
                  Factura
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              disabled={processingPayment}
            >
              Cancelar
            </Button>
            <Button onClick={processPayment} disabled={processingPayment}>
              {processingPayment ? 'Procesando...' : 'Completar Pago'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
