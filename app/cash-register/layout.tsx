import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caja Registradora',
  icons: {
    icon: '/favicons/cash-register.svg',
  },
};

export default function CashRegisterLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <>{children}</>;
}
