import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';

// Tipos para los elementos de navegación y formularios pendientes
interface NavItem {
  readonly name: string;
  readonly href: string;
  readonly icon: React.ElementType;
}

interface NavigationMenuProps {
  readonly collapsed: boolean;
  readonly navItems: readonly NavItem[];
  readonly pendingForms: readonly string[];
  readonly timeRemaining: string | null;
}

export function NavigationMenu({
  collapsed,
  navItems,
  pendingForms,
  timeRemaining,
}: NavigationMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-2">
      {navItems.map((item, index) => {
        const isFinances = item.href === '/finances';
        const hasPendingForms = pendingForms.length > 0;

        return (
          <div key={index}>
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={`justify- w-full${collapsed ? 'center' : 'start'} ${
                (pathname === item.href && 'bg-green-100 text-green-700') ||
                (isFinances && hasPendingForms && 'bg-red-50 text-red-600') ||
                'text-gray-600'
              }`}
              data-shortcut={index + 1}
              onClick={() => router.push(item.href)}
            >
              <item.icon className={`${collapsed ? '' : 'mr-2'} size-4`} />
              {!collapsed && item.name}
              {isFinances && hasPendingForms && !collapsed && (
                <div className="ml-auto flex items-center space-x-1">
                  <span className="size-2 animate-pulse rounded-full bg-red-500"></span>
                </div>
              )}
            </Button>

            {/* Mostrar iconos de formularios pendientes solo en finanzas */}
            {isFinances && hasPendingForms && !collapsed && (
              <div className="ml-4 mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-red-600">
                  <span>Formularios pendientes:</span>
                  {timeRemaining && (
                    <div className="flex items-center space-x-1">
                      <Clock className="size-3" />
                      <span>{timeRemaining}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  {pendingForms.includes('income') && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingUp className="size-3" />
                      <span>Ingreso</span>
                    </div>
                  )}
                  {pendingForms.includes('expense') && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <TrendingDown className="size-3" />
                      <span>Egreso</span>
                    </div>
                  )}
                  {pendingForms.includes('purchase') && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <ShoppingCart className="size-3" />
                      <span>Compra</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
