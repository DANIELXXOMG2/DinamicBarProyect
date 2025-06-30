'use client';

import { useState, useEffect } from 'react';

import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useFormPersistence } from '@/hooks/use-form-persistence';

interface ExpenseVoucherFormProperties {
  readonly onVoucherCreated: () => void;
}

interface VoucherData {
  description: string;
  amount: number;
  date: string;
  time: string;
}

export function ExpenseVoucherForm({
  onVoucherCreated,
}: ExpenseVoucherFormProperties) {
  const { toast } = useToast();
  const [voucher, setVoucher] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });
  const [saving, setSaving] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  // Hook de persistencia de formularios
  const { saveFormData, loadFormData, clearFormData, isLoaded } =
    useFormPersistence('expense');

  // Cargar datos persistidos al montar el componente
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData && savedData.voucher) {
      const { description, amount, date, time } =
        savedData.voucher as Partial<VoucherData>;
      if (
        description !== undefined &&
        amount !== undefined &&
        date !== undefined &&
        time !== undefined
      ) {
        setVoucher({ description, amount, date, time });
        toast({
          title: 'Datos recuperados',
          description: 'Se han cargado los datos guardados del formulario',
        });
      }
    }
  }, [loadFormData, toast]);

  // Guardar datos automáticamente cuando cambien (solo después de cargar)
  useEffect(() => {
    if (isLoaded && (voucher.description || voucher.amount > 0)) {
      const formData = { voucher };
      saveFormData(formData);
    }
  }, [voucher, saveFormData, isLoaded]);

  const handleCancel = () => {
    if (cancelConfirm) {
      // Segundo clic - confirmar cancelación
      clearFormData();
      setVoucher({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
      });
      onVoucherCreated();
    } else {
      // Primer clic - activar confirmación
      setCancelConfirm(true);
      setTimeout(() => setCancelConfirm(false), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!voucher.description.trim() || voucher.amount <= 0) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Guardar usando la API
      const response = await fetch('/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'EXPENSE',
          amount: voucher.amount,
          description: voucher.description,
          date: `${voucher.date}T${voucher.time}:00.000Z`,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el comprobante');
      }

      // Limpiar datos persistidos después del éxito
      clearFormData();

      toast({
        title: 'Éxito',
        description: 'Comprobante de egreso creado correctamente',
      });

      onVoucherCreated();
    } catch {
      toast({
        title: 'Error',
        description: 'Error al crear el comprobante',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Nuevo Comprobante de Egreso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={voucher.date}
                onChange={(event) =>
                  setVoucher({ ...voucher, date: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="time">Hora *</Label>
              <Input
                id="time"
                type="time"
                value={voucher.time}
                onChange={(event) =>
                  setVoucher({ ...voucher, time: event.target.value })
                }
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción/Razón *</Label>
            <Textarea
              id="description"
              placeholder="Describe el motivo del egreso..."
              value={voucher.description}
              onChange={(event) =>
                setVoucher({ ...voucher, description: event.target.value })
              }
              rows={3}
            />
          </div>

          {/* Valor */}
          <div>
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={voucher.amount || ''}
              onChange={(event) =>
                setVoucher({
                  ...voucher,
                  amount: Number.parseFloat(event.target.value) || 0,
                })
              }
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={
                saving || !voucher.description.trim() || voucher.amount <= 0
              }
              className="flex-1"
            >
              <Save className="mr-2 size-4" />
              {saving ? 'Guardando...' : 'Guardar Comprobante'}
            </Button>
            <Button
              variant={cancelConfirm ? 'destructive' : 'outline'}
              onClick={handleCancel}
              className={cancelConfirm ? 'animate-pulse' : ''}
            >
              {cancelConfirm ? '¿Confirmar?' : 'Cancelar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
