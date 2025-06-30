'use client';

import { useState } from 'react';

import { ExpenseVoucherForm } from './components/expense-voucher-form';
import { IncomeVoucherForm } from './components/income-voucher-form';
import { PurchaseForm } from './components/purchase-form';
import { PurchasesList } from './components/purchases-list';
import { VouchersList } from './components/vouchers-list';

export default function FinancesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleVoucherCreated = () => {
    setRefreshKey((previousKey) => previousKey + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Finanzas</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-lg border p-4 lg:col-span-1">
          <h2 className="mb-4 text-2xl font-semibold">Ingresos</h2>
          <IncomeVoucherForm onVoucherCreated={handleVoucherCreated} />
          <VouchersList key={refreshKey} type="income" />
        </div>

        <div className="flex flex-col gap-4 rounded-lg border p-4 lg:col-span-1">
          <h2 className="mb-4 text-2xl font-semibold">Egresos</h2>
          <ExpenseVoucherForm onVoucherCreated={handleVoucherCreated} />
          <VouchersList key={refreshKey} type="expense" />
        </div>

        <div className="flex flex-col gap-4 rounded-lg border p-4 lg:col-span-1">
          <h2 className="mb-4 text-2xl font-semibold">Compras</h2>
          <PurchaseForm onClose={() => {}} />
          <PurchasesList />
        </div>
      </div>
    </div>
  );
}
