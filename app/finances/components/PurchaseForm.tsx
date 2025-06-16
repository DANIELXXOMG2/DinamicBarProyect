"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save, Plus, Trash2, Package, ImagePlus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useFormPersistence } from "@/hooks/useFormPersistence"
import { PurchaseItem, Purchase, Product, Supplier } from "../types/purchase"

interface PurchaseFormProps {
  onClose: () => void
}

export function PurchaseForm({ onClose }: PurchaseFormProps) {
  const [purchase, setPurchase] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    supplierId: ""
  })
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    quantity: 1,
    purchasePrice: 0,
    salePrice: 0,
    iva: 0
  })
  const [saving, setSaving] = useState(false)
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: "", image: "" })
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ 
    name: "", 
    phone: "", 
    image: "", 
    nit: "", 
    address: "" 
  })
  const [cancelConfirm, setCancelConfirm] = useState(false)

  // Hook de persistencia de formularios
  const {
    saveFormData,
    loadFormData,
    clearFormData,
    isLoaded
  } = useFormPersistence('purchase')

  // Cargar datos persistidos al montar el componente
  useEffect(() => {
    const savedData = loadFormData()
    if (savedData) {
      setPurchase(savedData.purchase || purchase)
      setItems(savedData.items || [])
      setCurrentItem(savedData.currentItem || currentItem)
      setNewProduct(savedData.newProduct || newProduct)
      setShowNewProductForm(savedData.showNewProductForm || false)
      setNewSupplier(savedData.newSupplier || newSupplier)
      setShowNewSupplierForm(savedData.showNewSupplierForm || false)
      
      toast({
        title: "Datos recuperados",
        description: "Se han cargado los datos guardados del formulario"
      })
    }
  }, [])

  // Guardar datos automáticamente cuando cambien (solo después de cargar)
  useEffect(() => {
    if (isLoaded && (purchase.supplierId || items.length > 0 || currentItem.productId || newProduct.name || newSupplier.name)) {
      const formData = {
        purchase,
        items,
        currentItem,
        newProduct,
        showNewProductForm,
        newSupplier,
        showNewSupplierForm
      }
      saveFormData(formData)
    }
  }, [purchase, items, currentItem, newProduct, showNewProductForm, newSupplier, showNewSupplierForm, saveFormData, isLoaded])

  // Cargar productos y proveedores desde las APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar productos
        const productsResponse = await fetch('/api/products')
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData.products || [])
        }

        // Cargar proveedores
        const suppliersResponse = await fetch('/api/suppliers')
        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json()
          setSuppliers(suppliersData.suppliers || [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback a localStorage en caso de error
        const storedProducts = JSON.parse(localStorage.getItem('products') || '[]')
        const storedSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
        setProducts(storedProducts)
        setSuppliers(storedSuppliers)
      }
    }

    loadData()
  }, [])

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del producto es requerido",
        variant: "destructive"
      })
      return
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      image: newProduct.image || undefined
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: product.name,
          image: product.image
        })
      })

      if (response.ok) {
        const { product: createdProduct } = await response.json()
        const updatedProducts = [...products, createdProduct]
        setProducts(updatedProducts)
        setCurrentItem({ ...currentItem, productId: createdProduct.id })
      } else {
        throw new Error('Error creating product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      // Fallback a localStorage
      const updatedProducts = [...products, product]
      setProducts(updatedProducts)
      localStorage.setItem('products', JSON.stringify(updatedProducts))
      setCurrentItem({ ...currentItem, productId: product.id })
    }
    
    setCurrentItem({ ...currentItem, productId: product.id })
    setNewProduct({ name: "", image: "" })
    setShowNewProductForm(false)
    
    toast({
      title: "Éxito",
      description: "Producto creado correctamente"
    })
  }

  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del proveedor es requerido",
        variant: "destructive"
      })
      return
    }



    const supplier: Supplier = {
      id: Date.now().toString(),
      name: newSupplier.name,
      phone: newSupplier.phone || undefined,
      nit: newSupplier.nit || undefined,
      address: newSupplier.address || undefined
    }

    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: supplier.name,
          phone: supplier.phone,
          nit: supplier.nit,
          address: supplier.address
        })
      })

      if (response.ok) {
        const { supplier: createdSupplier } = await response.json()
        const updatedSuppliers = [...suppliers, createdSupplier]
        setSuppliers(updatedSuppliers)
        setPurchase({ ...purchase, supplierId: createdSupplier.id })

      } else {
        throw new Error('Error creating supplier')
      }
    } catch (error) {
      console.error('Error creating supplier:', error)
      // Fallback a localStorage
      const updatedSuppliers = [...suppliers, supplier]
      setSuppliers(updatedSuppliers)
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers))
      setPurchase({ ...purchase, supplierId: supplier.id })

    }
    
    // Limpiar el estado del formulario
    setNewSupplier({ name: "", phone: "", image: "", nit: "", address: "" })
    setShowNewSupplierForm(false)
    
    toast({
      title: "Éxito",
      description: "Proveedor creado correctamente"
    })
  }

  const handleSupplierChange = (supplierId: string) => {
    setPurchase({ ...purchase, supplierId })
  }

  const handleCancel = () => {
    if (cancelConfirm) {
      // Segundo clic - confirmar cancelación
      clearFormData()
      setPurchase({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        supplierId: ""
      })
      setItems([])
      setCurrentItem({
        productId: "",
        quantity: 1,
        purchasePrice: 0,
        salePrice: 0,
        iva: 0
      })
      setNewProduct({ name: "", image: "" })
      setShowNewProductForm(false)
      setNewSupplier({ name: "", phone: "", image: "", nit: "", address: "" })
      setShowNewSupplierForm(false)

      setCancelConfirm(false)
      onClose()
    } else {
      // Primer clic - activar confirmación
      setCancelConfirm(true)
      setTimeout(() => setCancelConfirm(false), 3000)
    }
  }

  const handleAddItem = () => {
    if (!currentItem.productId || currentItem.quantity <= 0 || currentItem.purchasePrice <= 0 || currentItem.salePrice <= 0) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios del producto",
        variant: "destructive"
      })
      return
    }

    const product = products.find(p => p.id === currentItem.productId)
    if (!product) return

    const itemTotal = currentItem.quantity * currentItem.purchasePrice
    const ivaAmount = (itemTotal * (currentItem.iva || 0)) / 100
    const total = itemTotal + ivaAmount

    const newItem: PurchaseItem = {
      productId: currentItem.productId,
      productName: product.name,
      productImage: product.image,
      quantity: currentItem.quantity,
      purchasePrice: currentItem.purchasePrice,
      salePrice: currentItem.salePrice,
      iva: currentItem.iva,
      total
    }

    setItems([...items, newItem])
    setCurrentItem({
      productId: "",
      quantity: 1,
      purchasePrice: 0,
      salePrice: 0,
      iva: 0
    })
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0)
    const totalIva = items.reduce((sum, item) => sum + ((item.quantity * item.purchasePrice * (item.iva || 0)) / 100), 0)
    const grandTotal = subtotal + totalIva
    return { subtotal, totalIva, grandTotal }
  }

  const { subtotal, totalIva, grandTotal } = calculateTotals()

  const handleSubmit = async () => {
    if (!purchase.supplierId || items.length === 0) {
      toast({
        title: "Error",
        description: "Seleccione un proveedor y agregue al menos un producto",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    
    try {
      const supplier = suppliers.find(s => s.id === purchase.supplierId)
      const newPurchase: Purchase = {
        id: Date.now().toString(),
        date: purchase.date,
        time: purchase.time,
        supplierId: purchase.supplierId,
        supplierName: supplier?.name || "",
        items,
        subtotal,
        totalIva,
        grandTotal,
        createdAt: new Date().toISOString()
      }

      // Guardar en la API
      try {
        const response = await fetch('/api/purchases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newPurchase)
        })

        if (!response.ok) {
          throw new Error('Error saving to API')
        }
      } catch (apiError) {
        console.error('Error saving to API, falling back to localStorage:', apiError)
        // Fallback a localStorage
        const existingPurchases = JSON.parse(localStorage.getItem('purchases') || '[]')
        existingPurchases.push(newPurchase)
        localStorage.setItem('purchases', JSON.stringify(existingPurchases))
      }

      // Limpiar datos persistidos después del éxito
      clearFormData()
      
      toast({
        title: "Éxito",
        description: "Compra registrada correctamente"
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al registrar la compra",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Nueva Compra</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Fecha, Hora y Proveedor */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={purchase.date}
              onChange={(e) => setPurchase({ ...purchase, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="time">Hora *</Label>
            <Input
              id="time"
              type="time"
              value={purchase.time}
              onChange={(e) => setPurchase({ ...purchase, time: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="supplier">Proveedor *</Label>
            <div className="flex items-center gap-1">
              <Select value={purchase.supplierId} onValueChange={handleSupplierChange}>
                <SelectTrigger className="flex-1 min-w-0">
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowNewSupplierForm(true)}
                className="px-2 py-1 h-8 w-8 flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>



        {/* Agregar Producto */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Agregar Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewProductForm ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Label htmlFor="product">Producto *</Label>
                  <Select value={currentItem.productId} onValueChange={(value) => setCurrentItem({ ...currentItem, productId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewProductForm(true)}
                  className="mt-6"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Crear
                </Button>
              </div>
            ) : (
              <div className="space-y-2 p-3 border rounded-md bg-gray-50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Crear Nuevo Producto</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewProductForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Nombre del producto"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <div className="relative">
                  <Input
                    placeholder="URL de la imagen (opcional)"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <Button size="sm" onClick={handleAddProduct}>
                  Crear Producto
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Unidades *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="iva">IVA (%) - Opcional</Label>
                <Input
                  id="iva"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={currentItem.iva}
                  onChange={(e) => setCurrentItem({ ...currentItem, iva: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchasePrice">Precio Compra *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentItem.purchasePrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, purchasePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="salePrice">Precio Venta *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentItem.salePrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, salePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <Button onClick={handleAddItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </CardContent>
        </Card>

        {/* Lista de productos agregados */}
        {items.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Productos Agregados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} x ${item.purchasePrice.toFixed(2)}
                          {item.iva && item.iva > 0 && ` + ${item.iva}% IVA`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">${item.total.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA Total:</span>
                  <span>${totalIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones */}
        <div className="flex space-x-2 pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !purchase.supplierId || items.length === 0}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Registrar Compra"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className={`transition-all duration-300 ${
              cancelConfirm 
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                : 'hover:bg-gray-100'
            }`}
          >
            {cancelConfirm ? 'Confirmar Cancelar' : 'Cancelar'}
          </Button>
        </div>
      </div>

      {/* Modal para crear nuevo proveedor */}
      {showNewSupplierForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nuevo Proveedor</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowNewSupplierForm(false)
                  setNewSupplier({ name: "", phone: "", image: "", nit: "", address: "" })

                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Imagen del proveedor en la esquina superior izquierda */}
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0">
                  {newSupplier.image ? (
                    <img
                      src={newSupplier.image}
                      alt="Proveedor"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="supplierImage">Foto de la Empresa</Label>
                  <div className="relative">
                    <Input
                      id="supplierImage"
                      type="url"
                      placeholder="URL de la imagen o selecciona un archivo"
                      value={newSupplier.image}
                      onChange={(e) => setNewSupplier({ ...newSupplier, image: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => document.getElementById('supplierImageFile')?.click()}
                    >
                      <ImagePlus className="w-4 h-4" />
                    </Button>
                    <input
                      id="supplierImageFile"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const result = event.target?.result as string
                            setNewSupplier({ ...newSupplier, image: result })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Campos del proveedor */}
              <div>
                <Label htmlFor="supplierName">Nombre *</Label>
                <Input
                  id="supplierName"
                  placeholder="Nombre del proveedor"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="supplierPhone">Teléfono</Label>
                <Input
                  id="supplierPhone"
                  placeholder="Número de teléfono"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="supplierNit">NIT</Label>
                <Input
                  id="supplierNit"
                  placeholder="Número de identificación tributaria"
                  value={newSupplier.nit}
                  onChange={(e) => setNewSupplier({ ...newSupplier, nit: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="supplierAddress">Dirección</Label>
                <Input
                  id="supplierAddress"
                  placeholder="Dirección del proveedor"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                />
              </div>
              
              {/* Botones del modal */}
              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={handleAddSupplier}
                  disabled={!newSupplier.name.trim()}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Crear Proveedor
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewSupplierForm(false)
                    setNewSupplier({ name: "", phone: "", image: "", nit: "", address: "" })
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}