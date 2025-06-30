import type React from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { AuthProvider } from '@/hooks/use-auth';
import { ClientLayout } from '@/components/client-layout';

import '@/app/globals.css';

export const metadata = {
  generator: 'v0.dev',
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
          <Toaster />
          <KeyboardShortcuts />
        </ThemeProvider>
      </body>
    </html>
  );
}
