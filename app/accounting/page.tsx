'use client';

import { Calendar, Download, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contabilidad',
  icons: {
    icon: '/favicons/accounting.svg',
  },
};

export default function AccountingPage() {
  const transactions = [
    {
      id: 'T001',
      date: '2025-04-27',
      tab: 'Mesa 1',
      items: 3,
      total: 16.97,
      tip: 1.7,
      payment: 'Efectivo',
    },
    {
      id: 'T002',
      date: '2025-04-27',
      tab: 'Mesa 2',
      items: 3,
      total: 20.47,
      tip: 3,
      payment: 'Tarjeta',
    },
    {
      id: 'T003',
      date: '2025-04-26',
      tab: 'Mesa 3',
      items: 2,
      total: 11.48,
      tip: 0,
      payment: 'Efectivo',
    },
    {
      id: 'T004',
      date: '2025-04-26',
      tab: 'Mesa 1',
      items: 5,
      total: 34.95,
      tip: 5,
      payment: 'Tarjeta',
    },
    {
      id: 'T005',
      date: '2025-04-25',
      tab: 'Mesa 4',
      items: 4,
      total: 27.96,
      tip: 2.8,
      payment: 'Efectivo',
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Contabilidad</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>Filtrar por fecha</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="size-4" />
              <span>Filtros</span>
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="size-4" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-md bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Ventas Totales</div>
            <div className="text-2xl font-bold">$111.83</div>
          </div>
          <div className="rounded-md bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Transacciones</div>
            <div className="text-2xl font-bold">5</div>
          </div>
          <div className="rounded-md bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Promedio por Mesa</div>
            <div className="text-2xl font-bold">$22.37</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-md bg-white shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método de Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.tab}</TableCell>
                  <TableCell>{transaction.items}</TableCell>
                  <TableCell>${transaction.total.toFixed(2)}</TableCell>
                  <TableCell>${transaction.tip.toFixed(2)}</TableCell>
                  <TableCell>{transaction.payment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
