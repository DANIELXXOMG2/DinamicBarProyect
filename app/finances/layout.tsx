import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Finanzas',
  icons: {
    icon: '/favicons/finances.svg',
  },
};

export default function FinancesLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <>{children}</>;
}
