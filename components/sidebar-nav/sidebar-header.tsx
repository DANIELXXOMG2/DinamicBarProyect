import Image from 'next/image';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { HeaderButtons } from './header-buttons';

// Definimos los tipos de las props que recibirá el componente
interface SidebarHeaderProps {
  readonly collapsed: boolean;
  readonly setCollapsed: (collapsed: boolean) => void;
  readonly storeConfig: { readonly logo?: string; readonly name?: string };
  readonly imageError: boolean;
  readonly setImageError: (error: boolean) => void;
  readonly pathname: string;
  readonly router: AppRouterInstance;
}

export function SidebarHeader({
  collapsed,
  setCollapsed,
  storeConfig,
  imageError,
  setImageError,
  pathname,
  router,
}: SidebarHeaderProps) {
  return (
    <div
      className={`${collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between'} mb-8`}
    >
      <div className="flex items-center gap-2">
        {storeConfig.logo && !imageError ? (
          <div className="flex size-8 items-center justify-center overflow-hidden rounded bg-gray-100">
            <Image
              src={storeConfig.logo}
              alt={`Logo de ${storeConfig.name || 'Restaurante'}`}
              width={32}
              height={32}
              className="object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="flex size-8 items-center justify-center rounded bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
        )}
        {!collapsed && (
          <span className="font-semibold">
            {storeConfig.name || 'Restaurante'}
          </span>
        )}
      </div>

      <HeaderButtons
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        pathname={pathname}
        router={router}
      />
    </div>
  );
}
