'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

const shortcuts = {
  '/': 'Alt + F: Buscar, Alt + 1-7: Categorías',
  '/products': 'Alt + F: Buscar, Alt + 1-7: Categorías',
  '/tables': 'Alt + [1-9] para seleccionar una mesa',
  '/inventory': 'Alt + F para buscar productos',
  '/finances': 'Alt + 1, 2, 3 para navegar entre formularios',
  default: 'Alt + C para ir a configuración',
};

const handleProductsShortcut = (event: KeyboardEvent) => {
  if (event.key === 'f') {
    event.preventDefault();
    const searchInput = document.querySelector(
      '#product-search'
    ) as HTMLElement;
    if (searchInput) {
      searchInput.focus();
    }
  } else if (
    !Number.isNaN(Number.parseInt(event.key)) &&
    Number.parseInt(event.key) >= 1 &&
    Number.parseInt(event.key) <= 7
  ) {
    event.preventDefault();
    const categoryIndex = Number.parseInt(event.key) - 1;
    const categoryEvent = new CustomEvent('category-shortcut', {
      detail: { categoryIndex },
    });
    globalThis.dispatchEvent(categoryEvent);
  }
};

const handleTablesShortcut = (event: KeyboardEvent) => {
  const keyNumber = Number.parseInt(event.key);
  if (!Number.isNaN(keyNumber) && keyNumber >= 1 && keyNumber <= 9) {
    event.preventDefault();
    const tableIndex = keyNumber - 1;
    const tableEvent = new CustomEvent('table-shortcut', {
      detail: { tableIndex },
    });
    globalThis.dispatchEvent(tableEvent);
  }
};

const handleInventoryShortcut = (event: KeyboardEvent) => {
  if (event.key === 'f') {
    event.preventDefault();
    const searchInput = document.querySelector(
      '#inventory-search'
    ) as HTMLElement;
    if (searchInput) {
      searchInput.focus();
    }
  }
};

const handleFinancesShortcut = (event: KeyboardEvent) => {
  if (['1', '2', '3'].includes(event.key)) {
    event.preventDefault();
    console.log(`Navegar al formulario ${event.key}`);
    toast({
      title: 'Atajo activado',
      description: `Navegando al formulario ${event.key}...`,
    });
  }
};

export function KeyboardShortcuts() {
  const pathname = usePathname();
  const router = useRouter();
  const [shortcutText, setShortcutText] = useState('');
  const [previousRoute, setPreviousRoute] = useState('/');

  useEffect(() => {
    const newText =
      shortcuts[pathname as keyof typeof shortcuts] || shortcuts.default;
    setShortcutText(newText);
  }, [pathname]);

  const handleGlobalShortcut = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'c') {
        event.preventDefault();
        if (pathname === '/settings') {
          router.push(previousRoute);
        } else {
          setPreviousRoute(pathname);
          router.push('/settings');
        }
      }
    },
    [pathname, router, previousRoute]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!event.altKey) return;

      handleGlobalShortcut(event);

      switch (pathname) {
        case '/':
        case '/products': {
          handleProductsShortcut(event);
          break;
        }
        case '/tables': {
          handleTablesShortcut(event);
          break;
        }
        case '/inventory': {
          handleInventoryShortcut(event);
          break;
        }
        case '/finances': {
          handleFinancesShortcut(event);
          break;
        }
        default: {
          break;
        }
      }
    },
    [pathname, handleGlobalShortcut]
  );

  useEffect(() => {
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed bottom-4 right-4 rounded-lg bg-background p-2 px-4 text-sm text-muted-foreground shadow-lg">
      <p>
        <span className="font-bold">Atajos:</span> {shortcutText}
      </p>
    </div>
  );
}
