"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, Package, AlertTriangle, Upload, X, Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { ProductType } from "@prisma/client"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  minStock?: number
  type: ProductType
  image?: string | null
  categoryId: string
  category: {
    id: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
}

interface Category {
  id: string
  name: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [newItem, setNewItem] = useState({
    name: "",
    categoryId: "",
    stock: 0,
    price: 0,
    type: "NON_ALCOHOLIC" as ProductType,
    minStock: 0,
    image: "",
  })
  
  const [imageMethod, setImageMethod] = useState<"url" | "upload">("url")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [editImageMethod, setEditImageMethod] = useState<"url" | "upload">("url")
  const [editImageUrl, setEditImageUrl] = useState<string>("")  
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null)
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar productos
      const productsResponse = await fetch('/api/inventory/products')
      if (productsResponse.ok) {
        const { products } = await productsResponse.json()
        setProducts(products)
      }
      
      // Cargar categorías
      const categoriesResponse = await fetch('/api/inventory/categories')
      if (categoriesResponse.ok) {
        const { categories } = await categoriesResponse.json()
        setCategories(categories)
        if (categories.length > 0 && !newItem.categoryId) {
          setNewItem(prev => ({ ...prev, categoryId: categories[0].id }))
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Error al cargar los datos.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStockChange = async (id: string, change: number) => {
    try {
      const response = await fetch(`/api/inventory/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'increase',
          quantity: change
        })
      })

      if (response.ok) {
        const { product } = await response.json()
        setProducts(products.map(p => p.id === id ? product : p))
        toast({
          title: "Stock actualizado",
          description: `Stock de ${product.name} actualizado.`,
        })
      } else {
        throw new Error('Error al actualizar stock')
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el stock.",
        variant: "destructive"
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Error al subir la imagen')
    }

    const { url } = await response.json()
    return url
  }

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.categoryId || !newItem.price) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      let imageUrl = newItem.image

      // Si se seleccionó un archivo, subirlo
      if (imageMethod === 'upload' && selectedFile) {
        imageUrl = await uploadImage(selectedFile)
      }

      const response = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          image: imageUrl || undefined
        })
      })

      if (response.ok) {
        const { product } = await response.json()
        setProducts([...products, product])
        
        // Reset form
        setNewItem({
          name: "",
          categoryId: categories[0]?.id || "",
          stock: 0,
          price: 0,
          type: "NON_ALCOHOLIC",
          minStock: 0,
          image: "",
        })
        setSelectedFile(null)
        setPreviewUrl(null)
        
        toast({
          title: "Producto agregado",
          description: `${product.name} agregado al inventario.`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al agregar producto')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar el producto.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setEditSelectedFile(file)
      const url = URL.createObjectURL(file)
      setEditPreviewUrl(url)
    }
  }

  const handleUpdateImage = async (productId: string) => {
    try {
      setSaving(true)
      let imageUrl = editImageUrl

      // Si se seleccionó un archivo, subirlo
      if (editImageMethod === 'upload' && editSelectedFile) {
        imageUrl = await uploadImage(editSelectedFile)
      }

      const response = await fetch(`/api/inventory/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateImage',
          image: imageUrl
        })
      })

      if (response.ok) {
        const { product } = await response.json()
        setProducts(products.map(p => p.id === productId ? product : p))
        setEditingImage(null)
        setEditImageUrl("")
        setEditSelectedFile(null)
        setEditPreviewUrl(null)
        toast({
          title: "Imagen actualizada",
          description: `Imagen de ${product.name} actualizada correctamente.`,
        })
      } else {
        throw new Error('Error al actualizar imagen')
      }
    } catch (error) {
      console.error('Error updating image:', error)
      toast({
        title: "Error",
        description: "Error al actualizar la imagen.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async (productId: string) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/inventory/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'removeImage'
        })
      })

      if (response.ok) {
        const { product } = await response.json()
        setProducts(products.map(p => p.id === productId ? product : p))
        setShowDeleteConfirm(null)
        toast({
          title: "Imagen eliminada",
          description: `Imagen de ${product.name} eliminada correctamente.`,
        })
      } else {
        throw new Error('Error al eliminar imagen')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Error",
        description: "Error al eliminar la imagen.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const lowStockItems = products.filter(item => item.stock <= (item.minStock || 0))
  const totalValue = products.reduce((acc, item) => acc + (item.stock * item.price), 0)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">Total Productos</div>
                  <div className="text-2xl font-bold">{products.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-sm text-gray-500">Stock Bajo</div>
                  <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <div className="text-sm text-gray-500">Valor Total</div>
                <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <div className="text-sm text-gray-500">Unidades Totales</div>
                <div className="text-2xl font-bold">{products.reduce((acc, item) => acc + item.stock, 0)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agregar nuevo producto */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Añadir Nuevo Producto</CardTitle>
            <CardDescription>Agrega productos a tu inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              <Input
                placeholder="Nombre del producto"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="col-span-2"
              />
              <select
                className="border rounded-md px-3 py-2"
                value={newItem.categoryId}
                onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Stock inicial"
                value={newItem.stock}
                onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Precio"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Stock mínimo"
                value={newItem.minStock}
                onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
              />
              
              {/* Imagen del producto */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Imagen del producto</label>
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
              
              <Button 
                onClick={handleAddItem} 
                className="bg-green-600 hover:bg-green-700"
                disabled={saving}
              >
                {saving ? "Agregando..." : "Agregar Producto"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de inventario */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Stock Mín.</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Cargando productos...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No hay productos en el inventario
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="relative group">
                          {item.image ? (
                            <>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-md border"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.png'
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20"
                                  onClick={() => {
                                    setEditingImage(item.id)
                                    setEditImageUrl(item.image || "")
                                    setEditImageMethod("url")
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20"
                                  onClick={() => setShowDeleteConfirm(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div 
                              className="w-12 h-12 bg-gray-200 rounded-md border flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                              onClick={() => {
                                setEditingImage(item.id)
                                setEditImageUrl("")
                                setEditImageMethod("url")
                              }}
                            >
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category.name}</TableCell>
                      <TableCell>
                        <span className={item.stock <= (item.minStock || 0) ? "text-red-600 font-bold" : ""}>
                          {item.stock}
                        </span>
                      </TableCell>
                      <TableCell>{item.minStock || 0}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>${(item.stock * item.price).toFixed(2)}</TableCell>
                      <TableCell>
                        {item.stock <= (item.minStock || 0) ? (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            Bajo
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">Normal</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStockChange(item.id, -1)}
                            disabled={item.stock <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStockChange(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      
      {/* Modal para editar imagen */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Actualizar Imagen</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingImage(null)
                  setEditImageUrl("")
                  setEditSelectedFile(null)
                  setEditPreviewUrl(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={editImageMethod === 'url' ? 'default' : 'outline'}
                  onClick={() => setEditImageMethod('url')}
                  size="sm"
                >
                  URL
                </Button>
                <Button
                  type="button"
                  variant={editImageMethod === 'upload' ? 'default' : 'outline'}
                  onClick={() => setEditImageMethod('upload')}
                  size="sm"
                >
                  Subir archivo
                </Button>
              </div>
              
              {editImageMethod === 'url' && (
                <Input
                  placeholder="URL de la imagen"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                />
              )}
              
              {editImageMethod === 'upload' && (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {editPreviewUrl && (
                    <div className="mt-2">
                      <img
                        src={editPreviewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md border mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}
              
              {editImageUrl && editImageMethod === 'url' && (
                <div className="mt-2">
                  <img
                    src={editImageUrl}
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
                  onClick={() => {
                    setEditingImage(null)
                    setEditImageUrl("")
                    setEditSelectedFile(null)
                    setEditPreviewUrl(null)
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleUpdateImage(editingImage)}
                  disabled={saving || (!editImageUrl && !editSelectedFile)}
                  className="flex-1"
                >
                  {saving ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación para eliminar imagen */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Previsualización de la imagen a eliminar */}
              {(() => {
                const product = products.find(p => p.id === showDeleteConfirm)
                return product?.image && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Imagen a eliminar:</p>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-md border mx-auto"
                    />
                  </div>
                )
              })()}
              
              <p className="text-center text-gray-700">
                ¿Estás seguro de que deseas eliminar la imagen de este producto?
              </p>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteImage(showDeleteConfirm)}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}