import { X } from 'lucide-react';
import Image from 'next/image';

import { Product } from '../types/index';
import { Button } from '@/components/ui/button';

interface DeleteImageModalProperties {
  readonly isOpen: boolean;
  readonly product: Product | null;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly saving: boolean;
}

export function DeleteImageModal({
  isOpen,
  product,
  onClose,
  onConfirm,
  saving,
}: DeleteImageModalProperties) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Previsualización de la imagen a eliminar */}
          {product.image && (
            <div className="text-center">
              <p className="mb-2 text-sm text-gray-600">Imagen a eliminar:</p>
              <Image
                src={product.image}
                alt={product.name}
                width={128}
                height={128}
                className="mx-auto rounded-md border object-cover"
              />
            </div>
          )}

          <p className="text-center text-gray-700">
            ¿Estás seguro de que deseas eliminar la imagen de este producto?
          </p>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
