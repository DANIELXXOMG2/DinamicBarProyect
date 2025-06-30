import type React from 'react';
import '@/app/globals.css';

export default function LoginLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
