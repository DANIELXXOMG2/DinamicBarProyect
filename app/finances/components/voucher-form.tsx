'use client';

import { useState, useEffect, useCallback } from 'react';

import { Save, PanelLeftClose } from 'lucide-react';

import { validateVoucherForm } from '../utils/validation-helpers';
import { useFormManager } from '../hooks/use-form-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useFormPersistence } from '@/hooks/use-form-persistence';

interface VoucherData {
  description: string;
  amount: number;
  date: string;
  time: string;
}

// Constantes para textos y configuración
const FORM_TEXTS = {
  income: {
    title: 'Nuevo Comprobante de Ingreso',
    placeholder: 'Describe el motivo del ingreso...',
    successMessage: 'Comprobante de ingreso creado correctamente',
  },
  expense: {
    title: 'Nuevo Comprobante de Egreso',
    placeholder: 'Describe el motivo del egreso...',
    successMessage: 'Comprobante de egreso creado correctamente',
  },
} as const;

const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS: 'Por favor complete todos los campos obligatorios',
  CREATE_ERROR: 'Error al crear el comprobante',
  DATA_RECOVERED: 'Se han cargado los datos guardados del formulario',
} as const;

// Función helper para obtener fecha y hora actual
const getCurrentDateTime = () => ({
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
});

interface VoucherFormProperties {
  readonly formType: 'income' | 'expense';
  readonly onVoucherCreated: () => void;
}

export function VoucherForm({
  formType,
  onVoucherCreated,
}: VoucherFormProperties) {
  const { toggleMinimize } = useFormManager();
  const { toast } = useToast();
  const [voucher, setVoucher] = useState<VoucherData>({
    description: '',
    amount: 0,
    ...getCurrentDateTime(),
  });
  const [saving, setSaving] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const { saveFormData, loadFormData, clearFormData, isLoaded } =
    useFormPersistence(formType);

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
          description: VALIDATION_MESSAGES.DATA_RECOVERED,
        });
      }
    }
  }, [loadFormData, toast]);

  useEffect(() => {
    if (isLoaded && (voucher.description || voucher.amount > 0)) {
      const formData = { voucher };
      saveFormData(formData);
    }
  }, [voucher, saveFormData, isLoaded]);

  const resetForm = useCallback(() => {
    setVoucher({
      description: '',
      amount: 0,
      ...getCurrentDateTime(),
    });
  }, []);

  const handleCancel = useCallback(() => {
    if (cancelConfirm) {
      clearFormData();
      resetForm();
      onVoucherCreated();
    } else {
      setCancelConfirm(true);
      setTimeout(() => setCancelConfirm(false), 3000);
    }
  }, [cancelConfirm, clearFormData, resetForm, onVoucherCreated]);

  const handleSubmit = async () => {
    const validation = validateVoucherForm(voucher);
    if (!validation.isValid) {
      toast({
        title: 'Error',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formType.toUpperCase(),
          amount: voucher.amount,
          description: voucher.description,
          date: `${voucher.date}T${voucher.time}:00.000Z`,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el comprobante');
      }

      clearFormData();

      toast({
        title: 'Éxito',
        description: FORM_TEXTS[formType].successMessage,
      });

      onVoucherCreated();
    } catch {
      toast({
        title: 'Error',
        description: VALIDATION_MESSAGES.CREATE_ERROR,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const { title, placeholder: descriptionPlaceholder } = FORM_TEXTS[formType];

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleMinimize(formType)}
        >
          <PanelLeftClose className="size-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${formType}-date`}>Fecha *</Label>
              <Input
                id={`${formType}-date`}
                type="date"
                value={voucher.date}
                onChange={(event) =>
                  setVoucher({ ...voucher, date: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor={`${formType}-time`}>Hora *</Label>
              <Input
                id={`${formType}-time`}
                type="time"
                value={voucher.time}
                onChange={(event) =>
                  setVoucher({ ...voucher, time: event.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`${formType}-description`}>
              Descripción/Razón *
            </Label>
            <Textarea
              id={`${formType}-description`}
              placeholder={descriptionPlaceholder}
              value={voucher.description}
              onChange={(event) =>
                setVoucher({ ...voucher, description: event.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor={`${formType}-amount`}>Valor *</Label>
            <Input
              id={`${formType}-amount`}
              type="number"
              placeholder="0.00"
              value={voucher.amount}
              onChange={(event) =>
                setVoucher({ ...voucher, amount: Number(event.target.value) })
              }
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant={cancelConfirm ? 'destructive' : 'outline'}
              onClick={handleCancel}
              disabled={saving}
            >
              {cancelConfirm ? 'Confirmar' : 'Cancelar'}
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              <Save className="mr-2 size-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
