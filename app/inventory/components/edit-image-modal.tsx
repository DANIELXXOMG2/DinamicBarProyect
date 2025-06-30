import { useState } from 'react';

import { X } from 'lucide-react';
import Image from 'next/image';

import { ImageMethod } from '../types/index';
import {
  ValidationUtils as ValidationUtilities,
  ImageUtils as ImageUtilities,
} from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditImageModalProperties {
  readonly isOpen: boolean;
  readonly currentImage?: string;
  readonly onClose: () => void;
  readonly onUpdate: (imageUrl: string, imageFile?: File) => void;
  readonly saving: boolean;
}

export function EditImageModal({
  isOpen,
  currentImage,
  onClose,
  onUpdate,
  saving,
}: EditImageModalProperties) {
  const [imageMethod, setImageMethod] = useState<ImageMethod>('url');
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = ValidationUtilities.validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(ImageUtilities.createPreviewUrl(file));
    }
  };

  const handleUpdate = () => {
    if (imageMethod === 'url') {
      const urlValidation = ValidationUtilities.validateImageUrl(imageUrl);
      if (!urlValidation.isValid) {
        alert(urlValidation.error);
        return;
      }
      onUpdate(imageUrl);
    } else if (imageMethod === 'upload' && selectedFile) {
      onUpdate('', selectedFile);
    }
  };

  const handleClose = () => {
    setImageUrl(currentImage || '');
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Actualizar Imagen</h3>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={imageMethod === 'url' ? 'default' : 'outline'}
              onClick={() => setImageMethod('url')}
              size="sm"
            >
              URL
            </Button>
            <Button
              type="button"
              variant={imageMethod === 'upload' ? 'default' : 'outline'}
              onClick={() => setImageMethod('upload')}
              size="sm"
            >
              Subir archivo
            </Button>
          </div>

          {imageMethod === 'url' && (
            <Input
              placeholder="URL de la imagen"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
          )}

          {imageMethod === 'upload' && (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
              {previewUrl && (
                <div className="mt-2">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="mx-auto rounded-md border object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {imageUrl && imageMethod === 'url' && (
            <div className="mt-2">
              <Image
                src={imageUrl}
                alt="Preview"
                width={128}
                height={128}
                className="mx-auto rounded-md border object-cover"
                onError={(event) => {
                  const target = event.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={saving || (!imageUrl && !selectedFile)}
              className="flex-1"
            >
              {saving ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
