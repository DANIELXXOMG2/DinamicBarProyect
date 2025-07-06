import { Product, Category } from '../types/purchase';

// Constantes para validación y configuración
export const PURCHASE_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  CANCEL_CONFIRM_TIMEOUT: 3000,
  DEFAULT_PAYMENT_METHOD: 'CASH' as const,
  DEFAULT_PRODUCT_TYPE: 'NON_ALCOHOLIC' as const,
} as const;

// Mensajes de validación y notificaciones
export const PURCHASE_MESSAGES = {
  VALIDATION: {
    PRODUCT_REQUIRED:
      'Nombre y categoría son requeridos para el nuevo producto',
    SUPPLIER_REQUIRED: 'El nombre del proveedor es requerido',
    ITEM_FIELDS_REQUIRED: 'Complete todos los campos obligatorios del producto',
    PURCHASE_FIELDS_REQUIRED:
      'Seleccione un proveedor y agregue al menos un producto',
    ITEMS_REQUIRED: 'Agregue al menos un producto a la compra',
  },
  SUCCESS: {
    PRODUCT_READY: 'se agregará al registrar la compra.',
    SUPPLIER_CREATED: 'Proveedor creado correctamente',
    PURCHASE_CREATED: 'Compra registrada correctamente',
    DATA_RECOVERED: 'Se han cargado los datos guardados del formulario',
  },
  ERROR: {
    LOAD_PRODUCTS: 'Error loading products:',
    LOAD_SUPPLIERS: 'Error loading suppliers:',
    LOAD_CATEGORIES: 'Error loading categories:',
    CREATE_SUPPLIER: 'Error creating supplier:',
    CREATE_PURCHASE: 'Error al registrar la compra',
  },
} as const;

// Función para obtener fecha y hora actual
export const getCurrentDateTime = () => ({
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
});

// Función para validar un item de compra
export const isCurrentItemValid = (item: {
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

// Función para crear un producto temporal
export const createTemporaryProduct = (
  newProduct: {
    name: string;
    image: string;
    categoryId: string;
    type: 'ALCOHOLIC' | 'NON_ALCOHOLIC';
  },
  categories: Category[]
): Product => {
  const category = categories.find((c) => c.id === newProduct.categoryId);

  return {
    id: `new_${Date.now()}`,
    name: newProduct.name,
    image: newProduct.image || undefined,
    purchasePrice: 0,
    salePrice: 0,
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
};

// Re-exportar funciones de currency-helpers para mantener compatibilidad
export {
  calculateItemTotal,
  calculatePurchaseTotals,
} from './currency-helpers';

// Función para resetear el estado inicial de compra
export const getInitialPurchaseState = () => ({
  ...getCurrentDateTime(),
  supplierId: '',
  paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'TRANSFER',
});

// Función para resetear el estado inicial de item
export const getInitialItemState = () => ({
  productId: '',
  quantity: 1,
  purchasePrice: 0,
  salePrice: 0,
  iva: 0,
});

// Función para resetear el estado inicial de nuevo producto
export const getInitialNewProductState = () => ({
  name: '',
  image: '',
  categoryId: '',
  type: 'NON_ALCOHOLIC' as 'ALCOHOLIC' | 'NON_ALCOHOLIC',
});

// Función para resetear el estado inicial de nuevo proveedor
export const getInitialNewSupplierState = () => ({
  name: '',
  phone: '',
  image: '',
  nit: '',
  address: '',
});

// Función para manejar errores de API con fallback
export const handleApiError = (error: unknown, context: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${context}:`, errorMessage);
  return errorMessage;
};
