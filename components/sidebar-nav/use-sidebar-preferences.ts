import { useState, useEffect } from 'react';

export function useSidebarPreferences() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState) {
      setCollapsed(savedCollapsedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, [collapsed]);

  return { collapsed, setCollapsed };
}
