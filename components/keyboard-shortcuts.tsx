'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Navigation shortcuts (only Alt key)
      if (
        event.altKey &&
        !Number.isNaN(Number.parseInt(event.key)) &&
        Number.parseInt(event.key) >= 1 &&
        Number.parseInt(event.key) <= 6
      ) {
        event.preventDefault();
        const routes = [
          '/',
          '/products',
          '/inventory',
          '/open-tabs',
          '/accounting',
          '/settings',
        ];
        router.push(routes[Number.parseInt(event.key) - 1]);
      }

      // Help shortcut
      if (event.altKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        // Toggle help modal (this would need to be implemented in the component that uses this hook)
        const customEvent = new CustomEvent('toggleHelp');
        globalThis.dispatchEvent(customEvent);
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}
