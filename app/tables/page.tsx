'use client';

import { Header } from '@/components/header';
import { TableManagement } from '@/components/open-tabs';

export default function TablesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <TableManagement />
      </main>
    </div>
  );
}
