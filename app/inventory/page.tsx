"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { useInventoryData } from "./hooks/useInventoryData"
import { useAdminAuth } from "./hooks/useAdminAuth"
import { useInventoryFilters } from "./hooks/useInventoryFilters"
import { InventoryStats } from "./components/InventoryStats"
import { InventoryFilters } from "./components/InventoryFilters"
import { AddProductForm } from "./components/AddProductForm"
import { ProductsTable } from "./components/ProductsTable"
import { AdminAuthModal } from "./components/AdminAuthModal"
import { EditImageModal } from "./components/EditImageModal"
import { DeleteImageModal } from "./components/DeleteImageModal"
import { toast } from "@/hooks/use-toast"

export default function InventoryPage() {
  const {
    products,
    categories,
    loading,
    saving,
    addProduct,
    updateStock,
    updateProductImage,
    deleteProductImage
  } = useInventoryData()

  const {
    isAdmin,
    showAdminAuth,
    adminPassword,
    setAdminPassword,
    pendingAction,
    authError,
    isVerifying,
    requireAdminAuth,
    verifyAdminPassword,
    cancelAuth
  } = useAdminAuth()

  const {
    selectedCategory,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    handleCategorySelect,
    resetFilters,
    getProductCountByCategory,
    hasActiveFilters
  } = useInventoryFilters(products)

  // Estados para modales de imagen
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  
  // Productos derivados para los modales
  const editingProduct = editingImage ? products.find(p => p.id === editingImage) : null
  const productToDelete = showDeleteConfirm ? products.find(p => p.id === showDeleteConfirm) : null

  const handleStockChange = async (id: string, change: number) => {
    const action = {
      type: change > 0 ? 'increase' as const : 'decrease' as const,
      productId: id,
      amount: Math.abs(change)
    }

    // Si no es administrador, requerir autenticación
    if (requireAdminAuth(action)) {
      return
    }

    // Si es administrador, proceder directamente
    try {
      await updateStock(id, change)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleAdminVerification = async () => {
    const success = await verifyAdminPassword()
    if (success && pendingAction) {
      // Ejecutar la acción pendiente
      try {
        await updateStock(
          pendingAction.productId,
          pendingAction.type === 'increase' ? pendingAction.amount : -pendingAction.amount
        )
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  const handleEditImage = (productId: string, currentImage?: string) => {
    setEditingImage(productId)
  }

  const handleUpdateImage = async (imageUrl: string, imageFile?: File) => {
    if (!editingImage) return

    try {
      await updateProductImage(editingImage, imageUrl, imageFile)
      setEditingImage(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleDeleteImageRequest = (productId: string) => {
    setShowDeleteConfirm(productId)
  }

  const handleConfirmDeleteImage = async () => {
    if (!showDeleteConfirm) return

    try {
      await deleteProductImage(showDeleteConfirm)
      setShowDeleteConfirm(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleAddProduct = async (newProduct: any, imageFile?: File) => {
    if (!newProduct.name || !newProduct.categoryId || !newProduct.purchasePrice || !newProduct.salePrice) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive"
      })
      return
    }

    try {
      await addProduct(newProduct, imageFile)
    } catch (error) {
      // Error handling is done in the hook
    }
  }



  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto p-4">
        <div className="flex justify-between items-center mb-6">
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
          getCategoryProductCount={(categoryId: string) => getProductCountByCategory[categoryId] || 0}
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
  )
}