"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save, Plus, Trash2, Package } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useFormPersistence } from "@/hooks/useFormPersistence"

interface PurchaseFormProps {
  onClose: () => void
}

interface Product {
  id: string
  name: string
  image?: string
}

interface Supplier {
  id: string
  name: string
}

interface PurchaseItem {
  productId: string
  productName: string
  productImage?: string
  quantity: number
  purchasePrice: number
  salePrice: number
  iva?: number
  total: number
}

interface Purchase {
  id: string
  date: string
  time: string
  supplierId: string
  supplierName: string
  companyImage?: string
  items: PurchaseItem[]
  subtotal: number
  totalIva: number
  grandTotal: number
  createdAt: string
}

export function PurchaseForm({ onClose }: PurchaseFormProps) {
  const [purchase, setPurchase] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    supplierId: "",
    companyImage: ""
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

  // Hook de persistencia de formularios
  const {
    saveFormData,
    loadFormData,
    clearFormData
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
      
      toast({
        title: "Datos recuperados",
        description: "Se han cargado los datos guardados del formulario"
      })
    }
  }, [])

  // Guardar datos automáticamente cuando cambien
  useEffect(() => {
    const formData = {
      purchase,
      items,
      currentItem,
      newProduct,
      showNewProductForm
    }
    saveFormData(formData)
  }, [purchase, items, currentItem, newProduct, showNewProductForm, saveFormData])

  // Cargar productos y proveedores
  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]')
    const storedSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
    setProducts(storedProducts)
    setSuppliers(storedSuppliers)
  }, [])

  const handleAddProduct = () => {
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

    const updatedProducts = [...products, product]
    setProducts(updatedProducts)
    localStorage.setItem('products', JSON.stringify(updatedProducts))
    
    setCurrentItem({ ...currentItem, productId: product.id })
    setNewProduct({ name: "", image: "" })
    setShowNewProductForm(false)
    
    toast({
      title: "Éxito",
      description: "Producto creado correctamente"
    })
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
        companyImage: purchase.companyImage,
        items,
        subtotal,
        totalIva,
        grandTotal,
        createdAt: new Date().toISOString()
      }

      // Guardar en localStorage
      const existingPurchases = JSON.parse(localStorage.getItem('purchases') || '[]')
      existingPurchases.push(newPurchase)
      localStorage.setItem('purchases', JSON.stringify(existingPurchases))

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
        <div className="grid grid-cols-3 gap-4">
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
            <Select value={purchase.supplierId} onValueChange={(value) => setPurchase({ ...purchase, supplierId: value })}>
              <SelectTrigger>
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
          </div>
        </div>

        {/* Imagen de la empresa */}
        <div>
          <Label htmlFor="companyImage">Foto de la Empresa (Opcional)</Label>
          <Input
            id="companyImage"
            type="url"
            placeholder="URL de la imagen de la empresa"
            value={purchase.companyImage}
            onChange={(e) => setPurchase({ ...purchase, companyImage: e.target.value })}
          />
          {purchase.companyImage && (
            <div className="mt-2">
              <img
                src={purchase.companyImage}
                alt="Empresa"
                className="w-32 h-32 object-cover rounded-md border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
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
                <Input
                  placeholder="URL de la imagen (opcional)"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                />
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}