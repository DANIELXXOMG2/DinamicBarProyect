import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Productos',
  icons: {
    icon: '/favicons/products.svg',
  },
};

export default function ProductsLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <>{children}</>;
}
