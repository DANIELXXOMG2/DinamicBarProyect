'use client';

import { useState, useEffect } from 'react';

import {
  DollarSign,
  Calculator,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { Header } from '@/components/header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface CashRegister {
  id: string;
  openedAt: string;
  openedBy?: string;
  openingAmount: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  isOpen: boolean;
}

export default function CashRegisterPage() {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para apertura
  const [openingAmount, setOpeningAmount] = useState(0);

  // Estados para cierre
  const [closingAmount, setClosingAmount] = useState(0);

  // Estados para transacciones
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>(
    'INCOME'
  );
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionDescription, setTransactionDescription] = useState('');

  useEffect(() => {
    loadCashRegisterData();
  }, []);

  const loadCashRegisterData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cash-register');
      if (response.ok) {
        const { cashRegister } = await response.json();
        setCashRegister(cashRegister);
      }
    } catch (error) {
      console.error('Error loading cash register:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos de la caja registradora.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCashRegister = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/cash-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingAmount,
          openedBy: 'Usuario', // En una implementación real, obtener del contexto de usuario
          notes: 'Apertura de caja',
        }),
      });

      if (response.ok) {
        const { cashRegister } = await response.json();
        setCashRegister(cashRegister);
        setOpeningAmount(0);
        toast({
          title: 'Éxito',
          description: 'Caja registradora abierta exitosamente.',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Error al abrir la caja registradora.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error opening cash register:', error);
      toast({
        title: 'Error',
        description: 'Error al abrir la caja registradora.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseCashRegister = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/cash-register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingAmount,
          closedBy: 'Usuario',
          notes: 'Cierre de caja',
        }),
      });

      if (response.ok) {
        const { summary } = await response.json();
        setCashRegister(null);
        setClosingAmount(0);
        toast({
          title: 'Caja Cerrada',
          description: `Caja cerrada exitosamente. Diferencia: $${summary.difference.toFixed(2)}`,
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Error al cerrar la caja registradora.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error closing cash register:', error);
      toast({
        title: 'Error',
        description: 'Error al cerrar la caja registradora.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      if (!transactionDescription.trim() || transactionAmount <= 0) {
        toast({
          title: 'Error',
          description: 'Descripción y monto son requeridos.',
          variant: 'destructive',
        });
        return;
      }

      setSaving(true);

      const response = await fetch('/api/cash-register/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transactionType,
          amount: transactionAmount,
          description: transactionDescription,
          createdBy: 'Usuario',
        }),
      });

      if (response.ok) {
        setTransactionAmount(0);
        setTransactionDescription('');
        toast({
          title: 'Éxito',
          description: 'Transacción agregada exitosamente.',
        });
        // Recargar estado de la caja
        loadCashRegisterData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Error al agregar la transacción.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: 'Error al agregar la transacción.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Caja Registradora</h1>
          </div>

          {/* Estado actual de la caja */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="size-5" />
                Estado de la Caja Registradora
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cashRegister ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="size-4" />
                    <AlertDescription>
                      Caja abierta desde{' '}
                      {new Date(cashRegister.openedAt).toLocaleString('es-ES')}
                      {cashRegister.openedBy && ` por ${cashRegister.openedBy}`}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="text-sm text-blue-600">Monto Inicial</div>
                      <div className="text-2xl font-bold text-blue-900">
                        ${cashRegister.openingAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="text-sm text-green-600">
                        Ventas Totales
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        ${cashRegister.totalSales.toFixed(2)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4">
                      <div className="text-sm text-purple-600">Efectivo</div>
                      <div className="text-2xl font-bold text-purple-900">
                        ${cashRegister.totalCash.toFixed(2)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-orange-50 p-4">
                      <div className="text-sm text-orange-600">Tarjeta</div>
                      <div className="text-2xl font-bold text-orange-900">
                        ${cashRegister.totalCard.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Cerrar caja */}
                  <div className="border-t pt-4">
                    <h3 className="mb-4 text-lg font-semibold">Cerrar Caja</h3>
                    <div className="flex items-end gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="closingAmount">
                          Monto de Cierre (Efectivo Contado)
                        </Label>
                        <Input
                          id="closingAmount"
                          type="number"
                          step="0.01"
                          value={closingAmount}
                          onChange={(event) =>
                            setClosingAmount(Number(event.target.value))
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <Button
                        onClick={handleCloseCashRegister}
                        disabled={saving || closingAmount <= 0}
                        variant="destructive"
                      >
                        <Calculator className="mr-2 size-4" />
                        {saving ? 'Cerrando...' : 'Cerrar Caja'}
                      </Button>
                    </div>
                  </div>

                  {/* Agregar transacción */}
                  <div className="border-t pt-4">
                    <h3 className="mb-4 text-lg font-semibold">
                      Agregar Transacción
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor="transactionType">Tipo</Label>
                        <select
                          id="transactionType"
                          value={transactionType}
                          onChange={(event) =>
                            setTransactionType(
                              event.target.value as 'INCOME' | 'EXPENSE'
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="INCOME">Ingreso</option>
                          <option value="EXPENSE">Gasto</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transactionAmount">Monto</Label>
                        <Input
                          id="transactionAmount"
                          type="number"
                          step="0.01"
                          value={transactionAmount}
                          onChange={(event) =>
                            setTransactionAmount(Number(event.target.value))
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transactionDescription">
                          Descripción
                        </Label>
                        <Input
                          id="transactionDescription"
                          value={transactionDescription}
                          onChange={(event) =>
                            setTransactionDescription(event.target.value)
                          }
                          placeholder="Descripción de la transacción"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button
                          onClick={handleAddTransaction}
                          disabled={
                            saving ||
                            !transactionDescription.trim() ||
                            transactionAmount <= 0
                          }
                          className="w-full"
                        >
                          <Plus className="mr-2 size-4" />
                          {saving ? 'Agregando...' : 'Agregar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertDescription>
                      No hay una caja registradora abierta. Abre una caja para
                      comenzar a operar.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-end gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openingAmount">Monto de Apertura</Label>
                      <Input
                        id="openingAmount"
                        type="number"
                        step="0.01"
                        value={openingAmount}
                        onChange={(event) =>
                          setOpeningAmount(Number(event.target.value))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <Button
                      onClick={handleOpenCashRegister}
                      disabled={saving || openingAmount < 0}
                    >
                      <DollarSign className="mr-2 size-4" />
                      {saving ? 'Abriendo...' : 'Abrir Caja'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
