'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Plus,
  Save,
  Trash2,
  ImagePlus,
  Package,
  X,
  PanelLeftClose,
} from 'lucide-react';
import Image from 'next/image';

import { useFormManager } from '../hooks/use-form-manager';
import { PurchaseItem, Product, Supplier, Category } from '../types/purchase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useFormPersistence } from '@/hooks/use-form-persistence';

interface PurchaseFormProperties {
  readonly onClose: () => void;
}

const isCurrentItemValid = (item: {
  productId: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
}): boolean => {
  return !!(
    item.productId &&
    item.quantity > 0 &&
    item.purchasePrice > 0 &&
    item.salePrice > 0
  );
};

export function PurchaseForm({ onClose }: PurchaseFormProperties) {
  const { toggleMinimize } = useFormManager();
  const [purchase, setPurchase] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    supplierId: '',
    paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'TRANSFER',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: 1,
    purchasePrice: 0,
    salePrice: 0,
    iva: 0,
  });
  const [saving, setSaving] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    image: '',
    categoryId: '',
    type: 'NON_ALCOHOLIC' as 'ALCOHOLIC' | 'NON_ALCOHOLIC',
  });
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    image: '',
    nit: '',
    address: '',
  });
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [productSearch, setProductSearch] = useState('');

  // Hook de persistencia de formularios
  const {
    formData: savedData,
    saveFormData,
    clearFormData,
    isLoaded,
  } = useFormPersistence('purchase');

  // Cargar datos persistidos al montar el componente
  useEffect(() => {
    if (!isLoaded || !savedData || Object.keys(savedData).length === 0) return;

    const {
      purchase: p,
      items: i,
      currentItem: c,
      newProduct: nP,
      showNewProductForm: sNPF,
      newSupplier: nS,
      showNewSupplierForm: sNSF,
    } = savedData;

    if (p && typeof p === 'object') setPurchase(p as typeof purchase);
    if (i && Array.isArray(i)) setItems(i as PurchaseItem[]);
    if (c && typeof c === 'object') setCurrentItem(c as typeof currentItem);
    if (nP && typeof nP === 'object') setNewProduct(nP as typeof newProduct);
    if (typeof sNPF === 'boolean') setShowNewProductForm(sNPF);
    if (nS && typeof nS === 'object') setNewSupplier(nS as typeof newSupplier);
    if (typeof sNSF === 'boolean') setShowNewSupplierForm(sNSF);

    toast({
      title: 'Datos recuperados',
      description: 'Se han cargado los datos guardados del formulario',
    });
  }, [isLoaded, savedData]);

  const handleSaveForm = useCallback(() => {
    if (
      isLoaded &&
      (purchase.supplierId ||
        items.length > 0 ||
        currentItem.productId ||
        newProduct.name ||
        newSupplier.name)
    ) {
      const formData = {
        purchase,
        items,
        currentItem,
        newProduct,
        showNewProductForm,
        newSupplier,
        showNewSupplierForm,
      };
      saveFormData(formData);
    }
  }, [
    isLoaded,
    purchase,
    items,
    currentItem,
    newProduct,
    showNewProductForm,
    newSupplier,
    showNewSupplierForm,
    saveFormData,
  ]);

  // Guardar datos automáticamente cuando cambien (solo después de cargar)
  useEffect(() => {
    handleSaveForm();
  }, [handleSaveForm]);

  // Cargar productos y proveedores desde las APIs
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const parameters = new URLSearchParams();
        if (productSearch) {
          parameters.append('q', productSearch);
        }
        const productsResponse = await fetch(
          `/api/inventory/products?${parameters.toString()}`
        );
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
        }
      } catch (error: unknown) {
        console.error(
          'Error loading products:',
          error instanceof Error ? error.message : error
        );
        const storedProducts = JSON.parse(
          localStorage.getItem('products') || '[]'
        );
        setProducts(storedProducts);
      }
    };

    const debounceLoadProducts = setTimeout(() => {
      loadProducts();
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceLoadProducts);
  }, [productSearch]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        // Cargar proveedores
        const suppliersResponse = await fetch('/api/suppliers');
        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json();
          setSuppliers(suppliersData.suppliers || []);
        }
      } catch (error: unknown) {
        console.error(
          'Error loading suppliers:',
          error instanceof Error ? error.message : error
        );
        // Fallback a localStorage en caso de error
        const storedSuppliers = JSON.parse(
          localStorage.getItem('suppliers') || '[]'
        );
        setSuppliers(storedSuppliers);
      }
    };

    loadSuppliers();

    const loadCategories = async () => {
      try {
        const response = await fetch('/api/inventory/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error: unknown) {
        console.error(
          'Error loading categories:',
          error instanceof Error ? error.message : error
        );
      }
    };
    loadCategories();
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.name.trim() || !newProduct.categoryId) {
      toast({
        title: 'Error',
        description: 'Nombre y categoría son requeridos para el nuevo producto',
        variant: 'destructive',
      });
      return;
    }

    const category = categories.find((c) => c.id === newProduct.categoryId);

    const temporaryProduct: Product = {
      id: `new_${Date.now()}`,
      name: newProduct.name,
      image: newProduct.image || undefined,
      purchasePrice: 0, // Se definirá en el item
      salePrice: 0, // Se definirá en el item
      stock: 0,
      type: newProduct.type,
      categoryId: newProduct.categoryId,
      category: {
        id: category?.id || '',
        name: category?.name || '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((previous) => [...previous, temporaryProduct]);
    setCurrentItem({ ...currentItem, productId: temporaryProduct.id });
    setProductSearch(temporaryProduct.name);

    setNewProduct({
      name: '',
      image: '',
      categoryId: '',
      type: 'NON_ALCOHOLIC',
    });
    setShowNewProductForm(false);

    toast({
      title: 'Producto listo',
      description: `'${temporaryProduct.name}' se agregará al registrar la compra.`,
    });
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del proveedor es requerido',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSupplier.name,
          phone: newSupplier.phone,
          nit: newSupplier.nit,
          address: newSupplier.address,
          image: newSupplier.image,
        }),
      });

      if (response.ok) {
        const { supplier: createdSupplier } = await response.json();
        const updatedSuppliers = [...suppliers, createdSupplier];
        setSuppliers(updatedSuppliers);
        setPurchase({ ...purchase, supplierId: createdSupplier.id });
      } else {
        throw new Error('Error creating supplier');
      }
    } catch (error: unknown) {
      console.error(
        'Error creating supplier:',
        error instanceof Error ? error.message : error
      );
      // Fallback a localStorage
      // const updatedSuppliers = [...suppliers, supplier];
      // setSuppliers(updatedSuppliers);
      // localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      // setPurchase({ ...purchase, supplierId: supplier.id });
    }

    // Limpiar el estado del formulario
    setNewSupplier({ name: '', phone: '', image: '', nit: '', address: '' });
    setShowNewSupplierForm(false);

    toast({
      title: 'Éxito',
      description: 'Proveedor creado correctamente',
    });
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId) || null;
    setSelectedSupplier(supplier);
    setPurchase({ ...purchase, supplierId });
  };

  const handleCancel = () => {
    if (cancelConfirm) {
      // Segundo clic - confirmar cancelación
      clearFormData();
      setPurchase({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        supplierId: '',
        paymentMethod: 'CASH',
      });
      setItems([]);
      setCurrentItem({
        productId: '',
        quantity: 1,
        purchasePrice: 0,
        salePrice: 0,
        iva: 0,
      });
      setNewProduct({ name: '', image: '', categoryId: '', type: 'ALCOHOLIC' });
      setShowNewProductForm(false);
      setNewSupplier({ name: '', phone: '', image: '', nit: '', address: '' });
      setShowNewSupplierForm(false);

      setCancelConfirm(false);
      onClose();
    } else {
      // Primer clic - activar confirmación
      setCancelConfirm(true);
      setTimeout(() => setCancelConfirm(false), 3000);
    }
  };

  const handleAddItem = () => {
    if (!isCurrentItemValid(currentItem)) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos obligatorios del producto',
        variant: 'destructive',
      });
      return;
    }

    const product = products.find((p) => p.id === currentItem.productId);
    if (!product) return;

    const itemTotal = currentItem.quantity * currentItem.purchasePrice;
    const ivaAmount = (itemTotal * (currentItem.iva || 0)) / 100;
    const total = itemTotal + ivaAmount;

    const newItem: PurchaseItem = {
      productId: currentItem.productId,
      quantity: currentItem.quantity,
      purchasePrice: currentItem.purchasePrice,
      salePrice: currentItem.salePrice,
      iva: currentItem.iva,
      total,
      product: product,
    };

    setItems([...items, newItem]);
    setCurrentItem({
      productId: '',
      quantity: 1,
      purchasePrice: 0,
      salePrice: 0,
      iva: 0,
    });
    setProductSearch('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, index_) => index_ !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.purchasePrice,
      0
    );
    const totalIva = items.reduce(
      (sum, item) =>
        sum + (item.quantity * item.purchasePrice * (item.iva || 0)) / 100,
      0
    );
    const grandTotal = subtotal + totalIva;
    return { subtotal, totalIva, grandTotal };
  };

  const { subtotal, totalIva, grandTotal } = calculateTotals();

  const createProductFromItem = async (item: PurchaseItem) => {
    const temporaryProduct = products.find((p) => p.id === item.productId);
    if (!temporaryProduct) return; // No es un producto temporal

    const productPayload = {
      name: temporaryProduct.name,
      image: temporaryProduct.image,
      categoryId: temporaryProduct.categoryId,
      type: temporaryProduct.type,
      purchasePrice: item.purchasePrice,
      salePrice: item.salePrice,
      stock: item.quantity,
    };

    const response = await fetch('/api/inventory/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error al crear producto "${temporaryProduct.name}": ${errorData.error}`
      );
    }

    const { product: createdProduct } = await response.json();
    item.productId = createdProduct.id;
  };

  const createPurchasePayload = (itemsWithRealProductIds: PurchaseItem[]) => {
    const supplier = suppliers.find((s) => s.id === purchase.supplierId);
    return {
      date: purchase.date,
      time: purchase.time,
      supplierId: purchase.supplierId,
      supplierName: supplier?.name || '',
      items: itemsWithRealProductIds,
      subtotal,
      totalIva,
      grandTotal,
      paymentMethod: purchase.paymentMethod,
    };
  };

  const handleSubmit = async () => {
    if (!purchase.supplierId || items.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione un proveedor y agregue al menos un producto',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const itemsWithRealProductIds = [...items];

      for (const item of itemsWithRealProductIds) {
        if (item.productId.startsWith('new_')) {
          await createProductFromItem(item);
        }
      }

      const purchasePayload = createPurchasePayload(itemsWithRealProductIds);

      const purchaseResponse = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchasePayload),
      });

      if (!purchaseResponse.ok) {
        throw new Error('Error al registrar la compra');
      }

      toast({ title: 'Éxito', description: 'Compra registrada correctamente' });

      // Limpiar el formulario
      clearFormData();
      setPurchase({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        supplierId: '',
        paymentMethod: 'CASH',
      });
      setItems([]);
      setCurrentItem({
        productId: '',
        quantity: 1,
        purchasePrice: 0,
        salePrice: 0,
        iva: 0,
      });
      setProductSearch('');
      setSelectedSupplier(null);

      onClose();
    } catch (error: unknown) {
      console.error(
        'Error submitting purchase:',
        error instanceof Error ? error.message : error
      );
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al registrar la compra',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-h-[80vh] space-y-4 overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Nueva Compra</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleMinimize('purchase')}
        >
          <PanelLeftClose className="size-5" />
        </Button>
      </CardHeader>

      <div className="space-y-4">
        {/* Fecha, Hora y Proveedor */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={purchase.date}
              onChange={(event) =>
                setPurchase({ ...purchase, date: event.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="time">Hora *</Label>
            <Input
              id="time"
              type="time"
              value={purchase.time}
              onChange={(event) =>
                setPurchase({ ...purchase, time: event.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="paymentMethod">Método de pago</Label>
            <Select
              value={purchase.paymentMethod}
              onValueChange={(value: 'CASH' | 'CARD' | 'TRANSFER') => {
                setPurchase({ ...purchase, paymentMethod: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Efectivo</SelectItem>
                <SelectItem value="CARD">Tarjeta</SelectItem>
                <SelectItem value="TRANSFER">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-3 space-y-2">
            {selectedSupplier && selectedSupplier.image && (
              <div className="flex items-center justify-center rounded-md border p-2">
                <Image
                  src={selectedSupplier.image}
                  alt={selectedSupplier.name}
                  width={112}
                  height={112}
                  className="rounded-md object-contain"
                />
              </div>
            )}
            <div>
              <Label htmlFor="supplier">Proveedor *</Label>
              <div className="flex items-center gap-1">
                <Select
                  value={purchase.supplierId}
                  onValueChange={handleSupplierChange}
                >
                  <SelectTrigger className="min-w-0 flex-1">
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
                  className="size-8 shrink-0 px-2 py-1"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Agregar Producto */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Agregar Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showNewProductForm ? (
              <div className="space-y-2 rounded-md border bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Crear Nuevo Producto
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewProductForm(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Nombre del producto"
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct({ ...newProduct, name: event.target.value })
                  }
                />
                <Select
                  value={newProduct.categoryId}
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newProduct.type}
                  onValueChange={(value) =>
                    setNewProduct({
                      ...newProduct,
                      type: value as 'ALCOHOLIC' | 'NON_ALCOHOLIC',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NON_ALCOHOLIC">No Alcohólica</SelectItem>
                    <SelectItem value="ALCOHOLIC">Alcohólica</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="URL de la imagen (opcional)"
                  value={newProduct.image}
                  onChange={(event) =>
                    setNewProduct({ ...newProduct, image: event.target.value })
                  }
                />
                <Button size="sm" onClick={handleAddProduct}>
                  Crear Producto
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="product">Producto *</Label>
                <div className="flex items-center space-x-2">
                  <Command className="flex-1">
                    <CommandInput
                      placeholder="Buscar producto..."
                      value={productSearch}
                      onValueChange={setProductSearch}
                    />
                    {currentItem.productId === '' && (
                      <CommandList>
                        <CommandEmpty>
                          No se encontraron productos.
                        </CommandEmpty>
                        <CommandGroup>
                          {products
                            .filter((product) =>
                              product.name
                                .toLowerCase()
                                .includes(productSearch.toLowerCase())
                            )
                            .map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => {
                                  setCurrentItem({
                                    ...currentItem,
                                    productId: product.id,
                                    purchasePrice: product.purchasePrice || 0,
                                    salePrice: product.salePrice || 0,
                                  });
                                  setProductSearch(product.name);
                                }}
                              >
                                {product.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewProductForm(true)}
                    className="mt-0"
                  >
                    <Plus className="mr-1 size-4" />
                    Crear
                  </Button>
                </div>
              </div>
            )}

            {currentItem.productId && (
              <div className="flex items-center justify-between rounded-md border bg-gray-50 p-2">
                <p className="text-sm font-medium">
                  Producto:{' '}
                  {products.find((p) => p.id === currentItem.productId)?.name}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentItem({ ...currentItem, productId: '' });
                    setProductSearch(''); // Limpiar la búsqueda al deseleccionar
                  }}
                >
                  <X className="size-4" />
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
                  onChange={(event) =>
                    setCurrentItem({
                      ...currentItem,
                      quantity: Number.parseInt(event.target.value) || 1,
                    })
                  }
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
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      iva: Number.parseFloat(e.target.value) || 0,
                    })
                  }
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
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      purchasePrice: Number.parseFloat(e.target.value) || 0,
                    })
                  }
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
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      salePrice: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <Button onClick={handleAddItem} className="w-full">
              <Plus className="mr-2 size-4" />
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
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      {products.find((p) => p.id === item.productId)?.image ? (
                        <Image
                          src={
                            products.find((p) => p.id === item.productId)
                              ?.image || '/placeholder-product.png'
                          }
                          alt={
                            products.find((p) => p.id === item.productId)
                              ?.name || ''
                          }
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded bg-gray-200">
                          <Package className="size-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {products.find((p) => p.id === item.productId)?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} x ${item.purchasePrice.toFixed(2)}
                          {item.iva && item.iva > 0 && ` + ${item.iva}% IVA`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        ${item.total.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA Total:</span>
                  <span>${totalIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
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
            <Save className="mr-2 size-4" />
            {saving ? 'Guardando...' : 'Registrar Compra'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className={`transition-all duration-300 ${
              cancelConfirm
                ? 'animate-pulse bg-red-500 text-white hover:bg-red-600'
                : 'hover:bg-gray-100'
            }`}
          >
            {cancelConfirm ? 'Confirmar Cancelar' : 'Cancelar'}
          </Button>
        </div>
      </div>

      {/* Modal para crear nuevo proveedor */}
      {showNewSupplierForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Nuevo Proveedor</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewSupplierForm(false);
                  setNewSupplier({
                    name: '',
                    phone: '',
                    image: '',
                    nit: '',
                    address: '',
                  });
                }}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Imagen del proveedor en la esquina superior izquierda */}
              <div className="flex items-start space-x-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  {newSupplier.image ? (
                    <Image
                      src={newSupplier.image}
                      alt="Proveedor"
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Package className="size-6 text-gray-400" />
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
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          image: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 size-8 -translate-y-1/2 p-0"
                      onClick={() => {
                        const supplierImageFile = document.querySelector(
                          '#supplierImageFile'
                        ) as HTMLElement;
                        if (supplierImageFile) {
                          supplierImageFile.click();
                        }
                      }}
                    >
                      <ImagePlus className="size-4" />
                    </Button>
                    <input
                      id="supplierImageFile"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.addEventListener('load', (event) => {
                            const result = event.target?.result as string;
                            setNewSupplier({ ...newSupplier, image: result });
                          });
                          reader.readAsDataURL(file);
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
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="supplierPhone">Teléfono</Label>
                <Input
                  id="supplierPhone"
                  placeholder="Número de teléfono"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="supplierNit">NIT</Label>
                <Input
                  id="supplierNit"
                  placeholder="Número de identificación tributaria"
                  value={newSupplier.nit}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, nit: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="supplierAddress">Dirección</Label>
                <Input
                  id="supplierAddress"
                  placeholder="Dirección del proveedor"
                  value={newSupplier.address}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, address: e.target.value })
                  }
                />
              </div>

              {/* Botones del modal */}
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleAddSupplier}
                  disabled={!newSupplier.name.trim()}
                  className="flex-1"
                >
                  <Save className="mr-2 size-4" />
                  Crear Proveedor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewSupplierForm(false);
                    setNewSupplier({
                      name: '',
                      phone: '',
                      image: '',
                      nit: '',
                      address: '',
                    });
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
  );
}
