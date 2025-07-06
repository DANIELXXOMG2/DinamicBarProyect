'use client';

import { useState } from 'react';
import type { FormId } from './context/form-manager.context';

import { PanelLeftClose, PanelRightClose } from 'lucide-react';

import { VoucherForm } from './components/voucher-form';
import { PurchaseForm } from './components/purchase-form';
import { PurchasesList } from './components/purchases-list';
import { VouchersList } from './components/vouchers-list';
import { FormManagerProvider } from './context/form-manager.context';
import { useFormManager } from './hooks/use-form-manager';
import { Button } from '@/components/ui/button';

const formInfo: Record<FormId, { title: string; icon: JSX.Element }> = {
  income: {
    title: 'Ingresos',
    icon: <PanelLeftClose className="size-6" />,
  },
  expense: {
    title: 'Egresos',
    icon: <PanelRightClose className="size-6" />,
  },
  purchase: {
    title: 'Compras',
    icon: <PanelLeftClose className="size-6" />,
  },
};

const getFormIcon = (formId: FormId) => {
  switch (formId) {
    case 'income': {
      return formInfo.income.icon;
    }
    case 'expense': {
      return formInfo.expense.icon;
    }
    case 'purchase': {
      return formInfo.purchase.icon;
    }
    default: {
      throw new Error(`Invalid formId: ${formId}`);
    }
  }
};

function MinimizedFormsAside() {
  const { minimizedForms, toggleMinimize } = useFormManager();

  if (minimizedForms.length === 0) {
    return null;
  }

  return (
    <aside className="absolute left-0 top-1/2 flex -translate-y-1/2 flex-col space-y-2">
      {minimizedForms.map((formId) => (
        <Button
          key={formId}
          variant="outline"
          size="icon"
          onClick={() => toggleMinimize(formId)}
          className="size-12 rounded-r-lg border-l-0"
        >
          {getFormIcon(formId)}
        </Button>
      ))}
    </aside>
  );
}

function FinancesContent() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { minimizedForms } = useFormManager();

  const handleVoucherCreated = () => {
    setRefreshKey((previousKey) => previousKey + 1);
  };

  const getGridCols = () => {
    const visibleForms = 3 - minimizedForms.length;
    if (visibleForms === 3) return 'lg:grid-cols-3';
    if (visibleForms === 2) return 'lg:grid-cols-2';
    return 'lg:grid-cols-1';
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Finanzas</h1>
      </div>

      <div className={`grid grid-cols-1 gap-8 ${getGridCols()}`}>
        {!minimizedForms.includes('income') && (
          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <h2 className="mb-4 text-2xl font-semibold">Ingresos</h2>
            <VoucherForm
              formType="income"
              onVoucherCreated={handleVoucherCreated}
            />
            <VouchersList key={refreshKey} type="income" />
          </div>
        )}

        {!minimizedForms.includes('expense') && (
          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <h2 className="mb-4 text-2xl font-semibold">Egresos</h2>
            <VoucherForm
              formType="expense"
              onVoucherCreated={handleVoucherCreated}
            />
            <VouchersList key={refreshKey} type="expense" />
          </div>
        )}

        {!minimizedForms.includes('purchase') && (
          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <h2 className="mb-4 text-2xl font-semibold">Compras</h2>
            <PurchaseForm onClose={() => {}} />
            <PurchasesList />
          </div>
        )}
      </div>
    </div>
  );
}

export default function FinancesPage() {
  return (
    <FormManagerProvider>
      <div className="relative h-full">
        <MinimizedFormsAside />
        <FinancesContent />
      </div>
    </FormManagerProvider>
  );
}
