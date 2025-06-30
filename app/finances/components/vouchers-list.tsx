'use client';

import { useState, useEffect } from 'react';

import { Trash2, Calendar, Clock, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface Voucher {
  id: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  category?: string;
  createdAt: string;
}

interface VouchersListProperties {
  readonly type: 'income' | 'expense';
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function VouchersList({ type }: VouchersListProperties) {
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const storageKey = type === 'income' ? 'income_vouchers' : 'expense_vouchers';
  const title = type === 'income' ? 'Ingresos' : 'Egresos';
  const colorClass = type === 'income' ? 'text-green-600' : 'text-red-600';
  const bgColorClass = type === 'income' ? 'bg-green-50' : 'bg-red-50';

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const voucherType = type === 'income' ? 'INCOME' : 'EXPENSE';
        const response = await fetch(`/api/vouchers?type=${voucherType}`);
        if (response.ok) {
          const data = await response.json();
          const sortedVouchers = (data.vouchers || []).sort(
            (a: Voucher, b: Voucher) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAllVouchers(sortedVouchers);
        } else {
          console.error('Error loading vouchers from API');
          const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
          setAllVouchers(
            [...stored].sort(
              (a: Voucher, b: Voucher) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
          );
        }
      } catch (error) {
        console.error('Error loading vouchers:', error);
        const stored: Voucher[] = JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        );
        setAllVouchers(
          [...stored].sort(
            (a: Voucher, b: Voucher) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      }
    };

    loadVouchers();
  }, [type, storageKey]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = allVouchers.filter(
        (v) => v.date.split('T')[0] === selectedDate
      );
      setFilteredVouchers(filtered);
    } else {
      setFilteredVouchers(allVouchers);
    }
  }, [selectedDate, allVouchers]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este comprobante?')) {
      try {
        const response = await fetch(`/api/vouchers/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const updatedVouchers = allVouchers.filter((v) => v.id !== id);
          setAllVouchers(updatedVouchers);

          toast({
            title: 'Éxito',
            description: 'Comprobante eliminado correctamente',
          });
        } else {
          throw new Error('Error al eliminar el comprobante');
        }
      } catch (error) {
        console.error('Error deleting voucher:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el comprobante',
          variant: 'destructive',
        });
      }
    }
  };

  const getTotalAmount = () => {
    return filteredVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);
  };

  if (allVouchers.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <DollarSign className="mx-auto mb-4 size-12 opacity-50" />
        <p>No hay {title.toLowerCase()} registrados</p>
        <p className="text-sm">
          Haga clic en &apos;Nuevo&apos; para agregar uno
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen total */}
      <Card className={bgColorClass}>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total {title} (Filtrado)</p>
            <p className={`text-2xl font-bold ${colorClass}`}>
              ${getTotalAmount().toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filtro de fecha */}
      <div className="flex items-end space-x-4">
        <div className="grow">
          <Label htmlFor="date-filter">Filtrar por fecha</Label>
          <Input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <Button onClick={() => setSelectedDate('')}>Limpiar</Button>
      </div>

      {/* Lista de comprobantes */}
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {filteredVouchers.map((voucher) => (
          <Card key={voucher.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium">
                    {voucher.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="size-3" />
                      <span>{formatDate(voucher.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="size-3" />
                      <span>{voucher.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold ${colorClass}`}>
                    ${voucher.amount.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(voucher.id)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
