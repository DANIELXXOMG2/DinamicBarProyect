import { useState } from 'react';

import Image from 'next/image';

import { Category, NewProduct, ImageMethod } from '../types/index';
import {
  ValidationUtils as ValidationUtilities,
  ImageUtils as ImageUtilities,
} from '../utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AddProductFormProperties {
  readonly categories: readonly Category[];
  readonly onAddProduct: (
    product: NewProduct,
    imageFile?: File
  ) => Promise<void>;
  readonly saving: boolean;
}

export function AddProductForm({
  categories,
  onAddProduct,
  saving,
}: AddProductFormProperties) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [newItem, setNewItem] = useState<NewProduct>({
    name: '',
    categoryId: categories[0]?.id || '',
    stock: 0,
    minStock: 10,
    purchasePrice: 0,
    salePrice: 0,
    image: '',
    type: 'NON_ALCOHOLIC',
  });

  const [imageMethod, setImageMethod] = useState<ImageMethod>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    // Validar datos del producto
    const validation = ValidationUtilities.validateProductData(newItem);
    if (!validation.isValid) {
      alert(validation.errors[0].message);
      return;
    }

    // Validar URL de imagen si se proporcionó
    if (imageMethod === 'url' && newItem.image) {
      const urlValidation = ValidationUtilities.validateImageUrl(newItem.image);
      if (!urlValidation.isValid) {
        alert(urlValidation.error);
        return;
      }
    }

    try {
      await onAddProduct(
        newItem,
        imageMethod === 'upload' ? selectedFile || undefined : undefined
      );

      // Reset form
      setNewItem({
        name: '',
        categoryId: categories[0]?.id || '',
        stock: 0,
        minStock: 10,
        purchasePrice: 0,
        salePrice: 0,
        image: '',
        type: 'NON_ALCOHOLIC',
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch {
      // Error handling is done in the hook
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Añadir Nuevo Producto</CardTitle>
            <CardDescription>Agrega productos a tu inventario</CardDescription>
          </div>
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Nombre del producto */}
            <div className="col-span-1 md:col-span-2">
              <label
                htmlFor="product-name"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nombre del producto
              </label>
              <Input
                id="product-name"
                placeholder="Ingrese el nombre del producto"
                value={newItem.name}
                onChange={(event) =>
                  setNewItem({ ...newItem, name: event.target.value })
                }
              />
            </div>

            {/* Categoría */}
            <div>
              <label
                htmlFor="product-category"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Categoría
              </label>
              <Select
                value={newItem.categoryId}
                onValueChange={(value) => {
                  setNewItem({
                    ...newItem,
                    categoryId: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Precio Compra */}
            <div>
              <label
                htmlFor="product-purchase-price"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Precio Compra ($)
              </label>
              <Input
                id="product-purchase-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newItem.purchasePrice}
                onChange={(event) =>
                  setNewItem({
                    ...newItem,
                    purchasePrice: Number(event.target.value),
                  })
                }
              />
            </div>

            {/* Unidades */}
            <div>
              <label
                htmlFor="product-stock"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Unidades
              </label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                placeholder="0"
                value={newItem.stock}
                onChange={(event) =>
                  setNewItem({ ...newItem, stock: Number(event.target.value) })
                }
              />
            </div>

            {/* Stock Mínimo */}
            <div>
              <label
                htmlFor="product-min-stock"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Stock Mínimo
              </label>
              <Input
                id="product-min-stock"
                type="number"
                min="0"
                placeholder="10"
                value={newItem.minStock}
                onChange={(event) =>
                  setNewItem({
                    ...newItem,
                    minStock: Number(event.target.value),
                  })
                }
              />
            </div>

            {/* Precio Venta */}
            <div>
              <label
                htmlFor="product-sale-price"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Precio Venta ($)
              </label>
              <Input
                id="product-sale-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newItem.salePrice}
                onChange={(event) =>
                  setNewItem({
                    ...newItem,
                    salePrice: Number(event.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Imagen del producto y Botón de agregar */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Sección de imagen - 50% del ancho */}
            <div>
              <div className="space-y-2">
                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Imagen del producto
                </p>
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
                    value={newItem.image || ''}
                    onChange={(event) =>
                      setNewItem({ ...newItem, image: event.target.value })
                    }
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
                          width={80}
                          height={80}
                          className="rounded-md border object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {newItem.image && imageMethod === 'url' && (
                  <div className="mt-2">
                    <Image
                      src={newItem.image}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded-md border object-cover"
                      onError={(event) => {
                        const target = event.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Botón de agregar - 50% del ancho */}
            <div className="flex items-end">
              <Button
                onClick={handleSubmit}
                disabled={
                  saving ||
                  !newItem.name ||
                  !newItem.categoryId ||
                  !newItem.purchasePrice ||
                  !newItem.salePrice
                }
                className="w-full px-6 py-2 md:w-auto"
              >
                {saving ? 'Agregando...' : 'Agregar Producto'}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
