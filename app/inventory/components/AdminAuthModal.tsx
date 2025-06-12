import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdminAuthModalProps {
  isOpen: boolean
  password: string
  onPasswordChange: (password: string) => void
  onVerify: () => void
  onCancel: () => void
  error: string | null
  isVerifying: boolean
}

export function AdminAuthModal({
  isOpen,
  password,
  onPasswordChange,
  onVerify,
  onCancel,
  error,
  isVerifying
}: AdminAuthModalProps) {
  if (!isOpen) return null

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onVerify()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold">Autenticación de Administrador</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Esta acción requiere permisos de administrador. Por favor, ingresa la contraseña.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="admin-password">Contraseña de Administrador</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ingresa la contraseña"
              className="mt-1"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isVerifying}
            >
              Cancelar
            </Button>
            <Button
              onClick={onVerify}
              disabled={isVerifying || !password.trim()}
            >
              {isVerifying ? "Verificando..." : "Verificar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}