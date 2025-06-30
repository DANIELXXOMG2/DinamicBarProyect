'use client';

import React from 'react';

import { SidebarNav } from '@/components/sidebar-nav';

export function ClientLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
