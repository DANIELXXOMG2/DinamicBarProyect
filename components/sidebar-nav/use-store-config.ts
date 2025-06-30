import { useState, useEffect } from 'react';

export function useStoreConfig() {
  const [storeConfig, setStoreConfig] = useState({
    name: 'Mi Restaurante',
    logo: '/placeholder-logo.svg',
  });

  useEffect(() => {
    const loadStoreConfig = async () => {
      try {
        const response = await fetch('/api/store');
        if (response.ok) {
          const { store } = await response.json();
          if (store) {
            setStoreConfig({
              name: store.name || 'Mi Restaurante',
              logo: store.image || '/placeholder-logo.svg',
            });
          }
        }
      } catch (error) {
        console.warn('Error loading store config from API:', error);
      }
    };

    loadStoreConfig();

    const handleConfigUpdate = () => loadStoreConfig();
    globalThis.addEventListener('storeConfigUpdated', handleConfigUpdate);

    return () => {
      globalThis.removeEventListener('storeConfigUpdated', handleConfigUpdate);
    };
  }, []);

  return storeConfig;
}
