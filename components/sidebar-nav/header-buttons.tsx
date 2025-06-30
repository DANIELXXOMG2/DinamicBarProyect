import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface HeaderButtonsProps {
  readonly collapsed: boolean;
  readonly setCollapsed: (collapsed: boolean) => void;
  readonly pathname: string;
  readonly router: AppRouterInstance;
}

export function HeaderButtons({
  collapsed,
  setCollapsed,
  pathname,
  router,
}: HeaderButtonsProps) {
  const commonButtonProps = {
    variant: 'ghost' as const,
    size: 'icon' as const,
    className: 'size-8 rounded-full',
  };

  const settingsButton = (
    <Button
      {...commonButtonProps}
      className={`${commonButtonProps.className} ${pathname === '/settings' ? 'bg-gray-100 text-gray-700' : 'text-gray-600'}`}
      onClick={() => router.push('/settings')}
      aria-label="Configuración"
    >
      <Settings className="size-4" />
    </Button>
  );

  const toggleButton = (
    <Button
      {...commonButtonProps}
      onClick={() => setCollapsed(!collapsed)}
      aria-label={collapsed ? 'Expandir' : 'Colapsar'}
    >
      {collapsed ? (
        <ChevronRight className="size-4" />
      ) : (
        <ChevronLeft className="size-4" />
      )}
    </Button>
  );

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1">
        {toggleButton}
        {settingsButton}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {settingsButton}
      {toggleButton}
    </div>
  );
}
