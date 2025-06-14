import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageMethod } from "../types/index"
import { ValidationUtils, ImageUtils } from "../utils"

interface EditImageModalProps {
  isOpen: boolean
  currentImage?: string
  onClose: () => void
  onUpdate: (imageUrl: string, imageFile?: File) => void
  saving: boolean
}

export function EditImageModal({
  isOpen,
  currentImage,
  onClose,
  onUpdate,
  saving
}: EditImageModalProps) {
  const [imageMethod, setImageMethod] = useState<ImageMethod>("url")
  const [imageUrl, setImageUrl] = useState(currentImage || "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validation = ValidationUtils.validateImageFile(file)
      if (!validation.isValid) {
        alert(validation.error)
        return
      }
      
      setSelectedFile(file)
      setPreviewUrl(ImageUtils.createPreviewUrl(file))
    }
  }

  const handleUpdate = () => {
    if (imageMethod === 'url') {
      const urlValidation = ValidationUtils.validateImageUrl(imageUrl)
      if (!urlValidation.isValid) {
        alert(urlValidation.error)
        return
      }
      onUpdate(imageUrl)
    } else if (imageMethod === 'upload' && selectedFile) {
      onUpdate("", selectedFile)
    }
  }

  const handleClose = () => {
    setImageUrl(currentImage || "")
    setSelectedFile(null)
    setPreviewUrl(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Actualizar Imagen</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
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
              onChange={(e) => setImageUrl(e.target.value)}
            />
          )}
          
          {imageMethod === 'upload' && (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md border mx-auto"
                  />
                </div>
              )}
            </div>
          )}
          
          {imageUrl && imageMethod === 'url' && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md border mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={saving || (!imageUrl && !selectedFile)}
              className="flex-1"
            >
              {saving ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}