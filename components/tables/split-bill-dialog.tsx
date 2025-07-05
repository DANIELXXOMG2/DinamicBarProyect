'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface ProductOnTable {
  tabItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface SplitBillDialogProps {
  readonly details: readonly ProductOnTable[];
  readonly onSplitSubmit: (
    selectedItems: readonly (ProductOnTable & { splitQuantity: number })[]
  ) => void;
}

export function SplitBillDialog({
  details,
  onSplitSubmit,
}: SplitBillDialogProps) {
  const [splitQuantities, setSplitQuantities] = useState<
    Record<string, number>
  >({});
  const [amountReceived, setAmountReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [open, setOpen] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setSplitQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
  };

  const selectedItems = useMemo(() => {
    return details
      .map((item) => ({
        ...item,
        splitQuantity: splitQuantities[item.tabItemId] || 0,
      }))
      .filter((item) => item.splitQuantity > 0);
  }, [details, splitQuantities]);

  const total = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => acc + item.splitQuantity * item.price,
      0
    );
  }, [selectedItems]);

  const handleSubmit = () => {
    onSplitSubmit(selectedItems);
    setSplitQuantities({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Dividir Cuenta</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dividir Cuenta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto">
            {details.map((item) => {
              const splitQuantity = splitQuantities[item.tabItemId] || 0;
              return (
                <div
                  key={item.tabItemId}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: ${(item.price * splitQuantity).toLocaleString()}
                      <br />
                      Unidades restantes: {item.quantity - splitQuantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        handleQuantityChange(
                          item.tabItemId,
                          Math.max(0, splitQuantity - 1)
                        )
                      }
                      disabled={splitQuantity <= 0}
                    >
                      <MinusCircle className="size-5" />
                    </Button>
                    <span>{splitQuantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        handleQuantityChange(
                          item.tabItemId,
                          Math.min(item.quantity, splitQuantity + 1)
                        )
                      }
                      disabled={splitQuantity >= item.quantity}
                    >
                      <PlusCircle className="size-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold">
              <span>Total a pagar:</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="amount-received">Recibido:</Label>
              <Input
                id="amount-received"
                type="number"
                value={amountReceived || ''}
                onChange={(e) => setAmountReceived(Number(e.target.value))}
                className="w-32"
              />
            </div>
            <div className="flex justify-between font-bold">
              <span>Cambio:</span>
              <span>
                ${Math.max(0, amountReceived - total).toLocaleString()}
              </span>
            </div>
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === 'Efectivo' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('Efectivo')}
                >
                  Efectivo
                </Button>
                <Button
                  variant={paymentMethod === 'Tarjeta' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('Tarjeta')}
                >
                  Tarjeta
                </Button>
                <Button
                  variant={paymentMethod === 'Otro' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('Otro')}
                >
                  Otro
                </Button>
              </div>
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Pagar Selección
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
