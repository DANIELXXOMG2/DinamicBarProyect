import { useState } from 'react';
import { NewProduct, ImageMethod, Category } from '../types';
import { ValidationUtils, ImageUtils } from '../utils';

export function useProductForm(
  categories: readonly Category[],
  onAddProduct: (product: NewProduct, imageFile?: File) => Promise<void>
) {
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

  const handleInputChange = (
    field: keyof NewProduct,
    value: string | number
  ) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = ValidationUtils.validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(ImageUtils.createPreviewUrl(file));
      setImageMethod('upload');
    }
  };

  const handleImageUrlChange = (url: string) => {
    setNewItem((prev) => ({ ...prev, image: url }));
    setImageMethod('url');
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    const validation = ValidationUtils.validateProductData(newItem);
    if (!validation.isValid) {
      alert(validation.errors[0].message);
      return;
    }

    if (imageMethod === 'url' && newItem.image) {
      const urlValidation = ValidationUtils.validateImageUrl(newItem.image);
      if (!urlValidation.isValid) {
        alert(urlValidation.error);
        return;
      }
    }

    await onAddProduct(
      newItem,
      imageMethod === 'upload' ? selectedFile || undefined : undefined
    );

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
  };

  return {
    newItem,
    imageMethod,
    selectedFile,
    previewUrl,
    handleInputChange,
    handleFileChange,
    handleImageUrlChange,
    handleSubmit,
  };
}
