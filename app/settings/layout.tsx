import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Ajustes',
  icons: {
    icon: '/favicons/settings.svg',
  },
};

export default function SettingsLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <>{children}</>;
}
