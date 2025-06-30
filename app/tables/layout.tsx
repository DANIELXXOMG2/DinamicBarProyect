import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mesas',
  icons: {
    icon: '/favicons/tables.svg',
  },
};

export default function TablesLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <>{children}</>;
}
