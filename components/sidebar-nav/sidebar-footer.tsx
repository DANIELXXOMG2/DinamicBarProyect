import { Button } from '@/components/ui/button';
import { Calculator, DollarSign, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarFooterProps {
  readonly collapsed: boolean;
  readonly handleLogout: () => void;
}

export function SidebarFooter({ collapsed, handleLogout }: SidebarFooterProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="mt-auto space-y-2">
      <Button
        variant="ghost"
        className={`justify- w-full${collapsed ? 'center' : 'start'} ${pathname === '/sales' ? 'bg-green-100 text-green-700' : 'text-gray-600'}`}
        onClick={() => router.push('/sales')}
      >
        <Calculator className={`${collapsed ? '' : 'mr-2'} size-4`} />
        {!collapsed && 'Ventas'}
      </Button>
      <Button
        variant="ghost"
        className={`justify- w-full${collapsed ? 'center' : 'start'} ${pathname === '/cash-register' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
        onClick={() => router.push('/cash-register')}
      >
        <DollarSign className={`${collapsed ? '' : 'mr-2'} size-4`} />
        {!collapsed && 'Caja Registradora'}
      </Button>
      <Button
        variant="ghost"
        className={`justify- w-full${collapsed ? 'center' : 'start'} text-gray-600`}
        onClick={handleLogout}
      >
        <LogOut className={`${collapsed ? '' : 'mr-2'} size-4`} />
        {!collapsed && 'Cerrar Sesión'}
      </Button>
    </div>
  );
}
