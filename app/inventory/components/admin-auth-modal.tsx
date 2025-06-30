import { Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminAuthModalProperties {
  readonly isOpen: boolean;
  readonly password: string;
  readonly onPasswordChange: (password: string) => void;
  readonly onVerify: () => void;
  readonly onCancel: () => void;
  readonly error: string | null;
  readonly isVerifying: boolean;
}

export function AdminAuthModal({
  isOpen,
  password,
  onPasswordChange,
  onVerify,
  onCancel,
  error,
  isVerifying,
}: AdminAuthModalProperties) {
  if (!isOpen) return null;

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onVerify();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <Lock className="size-6 text-gray-600" />
          <h3 className="text-lg font-semibold">
            Autenticación de Administrador
          </h3>
        </div>

        <p className="mb-4 text-gray-600">
          Esta acción requiere permisos de administrador. Por favor, ingresa la
          contraseña.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="admin-password">Contraseña de Administrador</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ingresa la contraseña"
              className="mt-1"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isVerifying}>
              Cancelar
            </Button>
            <Button
              onClick={onVerify}
              disabled={isVerifying || !password.trim()}
            >
              {isVerifying ? 'Verificando...' : 'Verificar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
