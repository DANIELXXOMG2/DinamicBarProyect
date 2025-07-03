import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

import { InventoryService } from '../services/inventory-service';
import { PendingAction } from '../types/index';

export function useAdminAuth() {
  const { user } = useAuth();
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const requireAdminAuth = (action: PendingAction) => {
    if (user?.role === 'ADMIN') {
      return false; // No necesita autenticación
    }

    setPendingAction(action);
    setShowAdminAuth(true);
    return true; // Necesita autenticación
  };

  const verifyAdminPassword = async (): Promise<boolean> => {
    setIsVerifying(true);
    setAuthError(null);

    try {
      const isValid = await InventoryService.verifyAdminPassword(adminPassword);

      if (isValid) {
        // Contraseña correcta
        setShowAdminAuth(false);
        setAdminPassword('');
        setPendingAction(null);
        setAuthError(null);
        return true;
      } else {
        setAuthError('Contraseña de administrador incorrecta');
        return false;
      }
    } catch (error) {
      console.error('Error verifying admin password:', error);
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Error al verificar la contraseña'
      );
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const cancelAuth = () => {
    setShowAdminAuth(false);
    setAdminPassword('');
    setPendingAction(null);
    setAuthError(null);
  };

  return {
    showAdminAuth,
    adminPassword,
    pendingAction,
    authError,
    isVerifying,
    setAdminPassword,
    requireAdminAuth,
    verifyAdminPassword,
    cancelAuth,
  };
}
