'use client';

import { useState } from 'react';

import { AddProductForm } from './components/add-product-form';
import { AdminAuthModal } from './components/admin-auth-modal';
import { DeleteImageModal } from './components/delete-image-modal';
import { EditImageModal } from './components/edit-image-modal';
import { InventoryFilters } from './components/inventory-filters';
import { InventoryStats } from './components/inventory-stats';
import { ProductsTable } from './components/products-table';
import { useAdminAuth } from './hooks/use-admin-auth';
import { useInventoryData } from './hooks/use-inventory-data';
import { useInventoryFilters } from './hooks/use-inventory-filters';
import { NewProduct } from './types';

import { useToast } from '@/components/ui/use-toast';

export default function InventoryPage() {
  const { toast } = useToast();
  const {
    products,
    categories,
    loading,
    saving,
    addProduct,
    updateStock,
    updateProductImage,
    deleteProductImage,
    deleteProduct,
  } = useInventoryData();

  const {
    showAdminAuth,
    adminPassword,
    setAdminPassword,
    pendingAction,
    authError,
    isVerifying,
    requireAdminAuth,
    verifyAdminPassword,
    cancelAuth,
  } = useAdminAuth();

  const {
    selectedCategory,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    handleCategorySelect,
    resetFilters,
    getProductCountByCategory,
    hasActiveFilters,
  } = useInventoryFilters(products);

  // Estados para modales de imagen
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Productos derivados para los modales
  const editingProduct = editingImage
    ? products.find((p) => p.id === editingImage)
    : null;
  const productToDelete = showDeleteConfirm
    ? products.find((p) => p.id === showDeleteConfirm)
    : null;

  const handleStockChange = async (id: string, change: number) => {
    const action = {
      type: change > 0 ? ('increase' as const) : ('decrease' as const),
      productId: id,
      amount: Math.abs(change),
    };

    // Si no es administrador, requerir autenticación
    if (requireAdminAuth(action)) {
      return;
    }

    // Si es administrador, proceder directamente
    try {
      await updateStock(id, change);
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleAdminVerification = async () => {
    const success = await verifyAdminPassword();
    if (success && pendingAction) {
      try {
        if (pendingAction.type === 'deleteProduct') {
          await deleteProduct(pendingAction.productId);
        } else {
          await updateStock(
            pendingAction.productId,
            pendingAction.type === 'increase'
              ? pendingAction.amount
              : -pendingAction.amount
          );
        }
      } catch {
        // Error handling is done in the hook
      }
    }
  };

  const handleEditImage = (productId: string) => {
    setEditingImage(productId);
  };

  const handleUpdateImage = async (imageUrl: string, imageFile?: File) => {
    if (!editingImage) return;

    try {
      await updateProductImage(editingImage, imageUrl, imageFile);
      setEditingImage(null);
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleDeleteImageRequest = (productId: string) => {
    setShowDeleteConfirm(productId);
  };

  const handleConfirmDeleteImage = async () => {
    if (!showDeleteConfirm) return;

    try {
      await deleteProductImage(showDeleteConfirm);
      setShowDeleteConfirm(null);
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleDeleteProductRequest = (productId: string) => {
    const action = {
      type: 'deleteProduct' as const,
      productId,
    };

    if (requireAdminAuth(action)) {
      return;
    }

    // Si es admin, proceder directamente
    deleteProduct(productId);
  };

  const handleAddProduct = async (newProduct: NewProduct, imageFile?: File) => {
    if (
      !newProduct.name ||
      !newProduct.categoryId ||
      !newProduct.purchasePrice ||
      !newProduct.salePrice
    ) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addProduct(newProduct, imageFile);
    } catch {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
        </div>

        {/* Estadísticas */}
        <InventoryStats products={filteredProducts} />

        {/* Filtros */}
        <InventoryFilters
          categories={categories}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onCategorySelect={handleCategorySelect}
          onSearchChange={setSearchQuery}
          onResetFilters={resetFilters}
          getCategoryProductCount={getProductCountByCategory}
          totalProductsCount={products.length}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Formulario para agregar productos */}
        <AddProductForm
          categories={categories}
          onAddProduct={handleAddProduct}
          saving={saving}
        />

        {/* Tabla de productos */}
        <ProductsTable
          products={filteredProducts}
          loading={loading}
          onStockChange={handleStockChange}
          onEditImage={handleEditImage}
          onDeleteImage={handleDeleteImageRequest}
          onDeleteProduct={handleDeleteProductRequest}
          hasFilters={hasActiveFilters}
        />
      </main>

      {/* Modales */}
      <AdminAuthModal
        isOpen={showAdminAuth}
        password={adminPassword}
        onPasswordChange={setAdminPassword}
        onVerify={handleAdminVerification}
        onCancel={cancelAuth}
        error={authError}
        isVerifying={isVerifying}
      />

      <EditImageModal
        isOpen={!!editingImage}
        currentImage={editingProduct?.image}
        onClose={() => setEditingImage(null)}
        onUpdate={handleUpdateImage}
        saving={saving}
      />

      {productToDelete && (
        <DeleteImageModal
          isOpen={!!showDeleteConfirm}
          product={productToDelete}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={handleConfirmDeleteImage}
          saving={saving}
        />
      )}
    </div>
  );
}
