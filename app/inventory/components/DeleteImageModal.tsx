import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Product } from "../types/index"

interface DeleteImageModalProps {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onConfirm: () => void
  saving: boolean
}

export function DeleteImageModal({
  isOpen,
  product,
  onClose,
  onConfirm,
  saving
}: DeleteImageModalProps) {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Previsualización de la imagen a eliminar */}
          {product.image && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Imagen a eliminar:</p>
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-md border mx-auto"
              />
            </div>
          )}
          
          <p className="text-center text-gray-700">
            ¿Estás seguro de que deseas eliminar la imagen de este producto?
          </p>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}