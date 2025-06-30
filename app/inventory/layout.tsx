import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Inventario',
  icons: {
    icon: '/favicons/inventory.svg',
  },
};

export default function InventoryLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <>{children}</>;
}
