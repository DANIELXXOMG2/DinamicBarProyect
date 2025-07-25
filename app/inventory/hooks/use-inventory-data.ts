import { useState, useEffect } from 'react';

import { InventoryService } from '../services/inventory-service';
import { Product, Category, NewProduct } from '../types/index';
import { toast } from '@/hooks/use-toast';

export function useInventoryData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [productsData, categoriesData] = await Promise.all([
        InventoryService.getProducts(),
        InventoryService.getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (newProduct: NewProduct, imageFile?: File) => {
    try {
      setSaving(true);
      const productData = { ...newProduct };

      // Si se seleccionó un archivo, subirlo
      if (imageFile) {
        const imageUrl = await InventoryService.uploadImage(imageFile);
        productData.image = imageUrl;
      }

      const createdProduct = await InventoryService.createProduct(productData);
      setProducts((previous) => [...previous, createdProduct]);

      toast({
        title: 'Producto agregado',
        description: `${createdProduct.name} agregado al inventario.`,
      });

      return createdProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al agregar el producto.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setSaving(true);
      await InventoryService.deleteProduct(productId);
      setProducts((previous) => previous.filter((p) => p.id !== productId));

      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado correctamente.',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al eliminar el producto.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateStock = async (id: string, change: number) => {
    try {
      const action = change > 0 ? 'increase' : 'decrease';
      const quantity = Math.abs(change);

      const updatedProduct = await InventoryService.updateStock(
        id,
        action,
        quantity
      );
      setProducts((previous) =>
        previous.map((p) => (p.id === id ? updatedProduct : p))
      );

      toast({
        title: 'Stock actualizado',
        description: `Stock de ${updatedProduct.name} actualizado.`,
      });

      return updatedProduct;
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar el stock.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateProductImage = async (
    productId: string,
    imageUrl: string,
    imageFile?: File
  ) => {
    try {
      setSaving(true);
      let finalImageUrl = imageUrl;

      // Si se seleccionó un archivo, subirlo
      if (imageFile) {
        finalImageUrl = await InventoryService.uploadImage(imageFile);
      }

      const updatedProduct = await InventoryService.updateProductImage(
        productId,
        finalImageUrl
      );
      setProducts((previous) =>
        previous.map((p) => (p.id === productId ? updatedProduct : p))
      );

      toast({
        title: 'Imagen actualizada',
        description: `Imagen de ${updatedProduct.name} actualizada correctamente.`,
      });

      return updatedProduct;
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar la imagen.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteProductImage = async (productId: string) => {
    try {
      setSaving(true);
      const updatedProduct =
        await InventoryService.removeProductImage(productId);
      setProducts((previous) =>
        previous.map((p) => (p.id === productId ? updatedProduct : p))
      );

      toast({
        title: 'Imagen eliminada',
        description: `Imagen de ${updatedProduct.name} eliminada correctamente.`,
      });

      return updatedProduct;
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al eliminar la imagen.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return {
    products,
    categories,
    loading,
    saving,
    loadData,
    addProduct,
    updateStock,
    updateProductImage,
    deleteProductImage,
    deleteProduct,
  };
}
