'use client';

import { useState, useEffect } from 'react';

import { Trash2, Calendar, Clock, DollarSign } from 'lucide-react';

import {
  formatDate,
  getCurrentDateISO,
  filterByDate,
  sortByCreatedAt,
} from '../utils/date-helpers';
import { formatCurrency, calculateTotal } from '../utils/currency-helpers';
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

// Constantes para configuración de vouchers
const VOUCHER_CONFIG = {
  income: {
    title: 'Ingresos',
    colorClass: 'text-green-600',
    bgColorClass: 'bg-green-50',
    storageKey: 'income_vouchers',
    apiType: 'INCOME',
  },
  expense: {
    title: 'Egresos',
    colorClass: 'text-red-600',
    bgColorClass: 'bg-red-50',
    storageKey: 'expense_vouchers',
    apiType: 'EXPENSE',
  },
} as const;

const VOUCHER_MESSAGES = {
  DELETE_CONFIRM: '¿Está seguro de que desea eliminar este comprobante?',
  DELETE_SUCCESS: 'Comprobante eliminado correctamente',
  DELETE_ERROR: 'No se pudo eliminar el comprobante',
  NO_VOUCHERS: 'No hay {type} registrados',
  ADD_NEW: "Haga clic en 'Nuevo' para agregar uno",
} as const;

export function VouchersList({ type }: VouchersListProperties) {
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDateISO());

  const config = VOUCHER_CONFIG[type];
  const { title, colorClass, bgColorClass, storageKey } = config;

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const voucherType = config.apiType;
        const response = await fetch(`/api/vouchers?type=${voucherType}`);
        if (response.ok) {
          const data = await response.json();
          const vouchers = (data.vouchers || []) as Voucher[];
          const sortedVouchers = sortByCreatedAt(vouchers);
          setAllVouchers(sortedVouchers);
        } else {
          console.error('Error loading vouchers from API');
          const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
          setAllVouchers(sortByCreatedAt(stored));
        }
      } catch (error) {
        console.error('Error loading vouchers:', error);
        const stored: Voucher[] = JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        );
        setAllVouchers(sortByCreatedAt(stored));
      }
    };

    loadVouchers();
  }, [type, storageKey, config.apiType]);

  useEffect(() => {
    const filtered = filterByDate(allVouchers, selectedDate);
    setFilteredVouchers(selectedDate ? filtered : allVouchers);
  }, [selectedDate, allVouchers]);

  const handleDelete = async (id: string) => {
    if (confirm(VOUCHER_MESSAGES.DELETE_CONFIRM)) {
      try {
        const response = await fetch(`/api/vouchers/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const updatedVouchers = allVouchers.filter((v) => v.id !== id);
          setAllVouchers(updatedVouchers);

          toast({
            title: 'Éxito',
            description: VOUCHER_MESSAGES.DELETE_SUCCESS,
          });
        } else {
          throw new Error('Error al eliminar el comprobante');
        }
      } catch (error) {
        console.error('Error deleting voucher:', error);
        toast({
          title: 'Error',
          description: VOUCHER_MESSAGES.DELETE_ERROR,
          variant: 'destructive',
        });
      }
    }
  };

  const getTotalAmount = () => {
    return calculateTotal(filteredVouchers);
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
              {formatCurrency(getTotalAmount())}
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
                    {formatCurrency(voucher.amount)}
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
