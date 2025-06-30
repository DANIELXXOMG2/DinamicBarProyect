import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Ventas',
  icons: {
    icon: '/favicons/sales.svg',
  },
};

export default function SalesLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <>{children}</>;
}
