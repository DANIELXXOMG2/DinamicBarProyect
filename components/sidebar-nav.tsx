'use client';

import { useState } from 'react';
import { useCurrentUser } from './sidebar-nav/use-current-user';
import { useSidebarPreferences } from './sidebar-nav/use-sidebar-preferences';
import { useStoreConfig } from './sidebar-nav/use-store-config';
import { usePendingForms } from './sidebar-nav/use-pending-forms';

import { Beer, TableIcon, Package, DollarSign } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

import { toast } from '@/components/ui/use-toast';

// Definición del tipo User para TypeScript
type UserRole = 'ADMIN' | 'CASHIER' | 'WAITER';

const navItems = [
  { name: 'Bebidas', href: '/', icon: Beer },
  { name: 'Mesas', href: '/tables', icon: TableIcon },
  { name: 'Inventario', href: '/inventory', icon: Package },
  { name: 'Finanzas', href: '/finances', icon: DollarSign },
];

// Función para traducir el rol a español
const translateRole = (role: UserRole) => {
  switch (role) {
    case 'ADMIN': {
      return 'Administrador';
    }
    case 'CASHIER': {
      return 'Cajero';
    }
    case 'WAITER': {
      return 'Mesero';
    }
    default: {
      return role;
    }
  }
};

import { SidebarHeader } from './sidebar-nav/sidebar-header';
import { UserProfile } from './sidebar-nav/user-profile';
import { NavigationMenu } from './sidebar-nav/navigation-menu';
import { SidebarFooter } from './sidebar-nav/sidebar-footer';

export function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarPreferences();
  const currentUser = useCurrentUser();
  const storeConfig = useStoreConfig();
  const { pendingForms, timeRemaining } = usePendingForms();
  const [imageError, setImageError] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente',
    });
    router.push('/login');
  };

  return (
    <div
      className={`${collapsed ? 'w-16' : 'w-64'} flex h-screen flex-col border-r p-4 transition-all duration-200`}
    >
      <SidebarHeader
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        storeConfig={storeConfig}
        imageError={imageError}
        setImageError={setImageError}
        pathname={pathname}
        router={router}
      />

      <UserProfile
        collapsed={collapsed}
        currentUser={currentUser}
        translateRole={translateRole}
      />

      <NavigationMenu
        collapsed={collapsed}
        navItems={navItems}
        pendingForms={pendingForms}
        timeRemaining={timeRemaining}
      />

      <SidebarFooter collapsed={collapsed} handleLogout={handleLogout} />
    </div>
  );
}
