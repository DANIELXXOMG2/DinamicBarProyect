// Tipos principales del inventario
export interface Product {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  categoryId: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  salePrice: number;
  image?: string;
  type: ProductType;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewProduct {
  name: string;
  categoryId: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  salePrice: number;
  image?: string;
  type: ProductType;
}

// Tipos de producto
export type ProductType = 'NON_ALCOHOLIC' | 'ALCOHOLIC' | 'FOOD';

// Métodos de imagen
export type ImageMethod = 'url' | 'file' | 'upload';

// Acciones de stock
export type StockAction = 'increase' | 'decrease';

// Tipos para autenticación de administrador
export interface PendingAction {
  type: 'increase' | 'decrease';
  productId: string;
  amount: number;
}

export interface AdminAuthState {
  showModal: boolean;
  password: string;
  error: string;
  isVerifying: boolean;
  isAdmin: boolean;
  pendingAction: PendingAction | null;
}

// Tipos para filtros
export interface InventoryFilters {
  selectedCategory: string;
  searchQuery: string;
}

// Tipos para estadísticas
export interface InventoryStats {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  totalUnits: number;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface UploadResponse {
  url: string;
  filename: string;
}

// Tipos para formularios
export interface ProductFormData {
  name: string;
  categoryId: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  salePrice: number;
  type: ProductType;
  image?: string;
}

export interface ImageUpdateData {
  productId: string;
  imageUrl?: string;
  imageFile?: File;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
