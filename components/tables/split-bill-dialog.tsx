'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductOnTable {
  tabItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface SplitBillDialogProps {
  readonly details: readonly ProductOnTable[];
  readonly onSplitSubmit: (selectedItems: readonly ProductOnTable[]) => void;
}

export function SplitBillDialog({
  details,
  onSplitSubmit,
}: SplitBillDialogProps) {
  const [selectedItems, setSelectedItems] = useState<ProductOnTable[]>([]);
  const [amountReceived, setAmountReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [open, setOpen] = useState(false);

  const handleSelect = (item: ProductOnTable) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.tabItemId === item.tabItemId)
        ? prev.filter((i) => i.tabItemId !== item.tabItemId)
        : [...prev, item]
    );
  };

  const total = selectedItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const handleSubmit = () => {
    onSplitSubmit(selectedItems);
    setSelectedItems([]);
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
            {details.map((item) => (
              <div
                key={item.tabItemId}
                className="flex items-center justify-between"
              >
                <div>
                  <p>{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toLocaleString()}
                  </p>
                </div>
                <Checkbox
                  checked={selectedItems.some(
                    (i) => i.tabItemId === item.tabItemId
                  )}
                  onCheckedChange={() => handleSelect(item)}
                />
              </div>
            ))}
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
