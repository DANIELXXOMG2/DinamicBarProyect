import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Category, NewProduct, ImageMethod, ProductType } from "../types/index"
import { PRODUCT_TYPES, IMAGE_CONFIG, FORM_VALIDATION } from "../constants"
import { ValidationUtils, ImageUtils } from "../utils"

interface AddProductFormProps {
  categories: Category[]
  onAddProduct: (product: NewProduct, imageFile?: File) => Promise<void>
  saving: boolean
}

export function AddProductForm({ categories, onAddProduct, saving }: AddProductFormProps) {
  const [newItem, setNewItem] = useState<NewProduct>({
    name: "",
    categoryId: categories[0]?.id || "",
    stock: 0,
    purchasePrice: 0,
    salePrice: 0,
    image: "",
    type: "NON_ALCOHOLIC"
  })
  
  const [imageMethod, setImageMethod] = useState<ImageMethod>("url")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  const handleSubmit = async () => {
    // Validar datos del producto
    const validation = ValidationUtils.validateProductData(newItem)
    if (!validation.isValid) {
      alert(validation.errors[0].message)
      return
    }
    
    // Validar URL de imagen si se proporcionó
    if (imageMethod === 'url' && newItem.image) {
      const urlValidation = ValidationUtils.validateImageUrl(newItem.image)
      if (!urlValidation.isValid) {
        alert(urlValidation.error)
        return
      }
    }

    try {
      await onAddProduct(newItem, imageMethod === 'upload' ? selectedFile || undefined : undefined)
      
      // Reset form
      setNewItem({
        name: "",
        categoryId: categories[0]?.id || "",
        stock: 0,
        purchasePrice: 0,
        salePrice: 0,
        image: "",
        type: "NON_ALCOHOLIC"
      })
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Añadir Nuevo Producto</CardTitle>
        <CardDescription>Agrega productos a tu inventario</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Nombre del producto */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del producto
            </label>
            <Input
              placeholder="Ingrese el nombre del producto"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 h-10 max-h-10 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.categoryId}
              onChange={(e) => {
                setNewItem({ 
                  ...newItem, 
                  categoryId: e.target.value
                })
              }}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Precio Compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Compra ($)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={newItem.purchasePrice}
              onChange={(e) => setNewItem({ ...newItem, purchasePrice: Number(e.target.value) })}
            />
          </div>

          {/* Stock inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock inicial
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={newItem.stock}
              onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
            />
          </div>

          {/* Precio Venta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Venta ($)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={newItem.salePrice}
              onChange={(e) => setNewItem({ ...newItem, salePrice: Number(e.target.value) })}
            />
          </div>
        </div>
        
        {/* Imagen del producto */}
        <div className="mt-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Imagen del producto</label>
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
                value={newItem.image || ""}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
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
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            )}
            
            {newItem.image && imageMethod === 'url' && (
              <div className="mt-2">
                <img
                  src={newItem.image}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !newItem.name || !newItem.categoryId || !newItem.purchasePrice || !newItem.salePrice}
            className="px-6 py-2"
          >
            {saving ? "Agregando..." : "Agregar Producto"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}