import { STOCK_THRESHOLDS, IMAGE_CONFIG } from '../constants';
import {
  Product,
  ValidationError,
  FormValidationResult,
  ProductFormData as ProductData,
} from '../types/index';

/**
 * Utilidades para el manejo de productos
 */
export const ProductUtils = {
  /**
   * Verifica si un producto tiene stock bajo
   * @param product
   */
  isLowStock: (product: Product): boolean => {
    return (
      product.stock <=
      Math.max(product.minStock || 0, STOCK_THRESHOLDS.LOW_STOCK)
    );
  },

  /**
   * Calcula el valor total de un producto (stock * precio)
   * @param product
   */
  getTotalValue: (product: Product): number => {
    return product.stock * product.purchasePrice;
  },

  /**
   * Obtiene el estado del stock como string
   * @param product
   */
  getStockStatus: (product: Product): 'low' | 'normal' => {
    return ProductUtils.isLowStock(product) ? 'low' : 'normal';
  },

  /**
   * Formatea el precio como moneda
   * @param price
   */
  formatPrice: (price: number): string => {
    return `$${price.toFixed(2)}`;
  },

  /**
   * Filtra productos por categoría y búsqueda
   * @param products
   * @param categoryFilter
   * @param searchQuery
   */
  filterProducts: (
    products: Product[],
    categoryFilter: string,
    searchQuery: string
  ): Product[] => {
    return products.filter((product) => {
      const matchesCategory =
        !categoryFilter || product.categoryId === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  },

  /**
   * Obtiene el conteo de productos por categoría
   * @param products
   */
  getProductCountByCategory: (products: Product[]): Record<string, number> => {
    const categoryCounts: Record<string, number> = {};
    for (const product of products) {
      categoryCounts[product.categoryId] =
        (categoryCounts[product.categoryId] || 0) + 1;
    }
    return categoryCounts;
  },
};

/**
 * Utilidades para validación de formularios
 */
export const ValidationUtils = {
  /**
   * Valida los datos de un nuevo producto
   * @param data
   */
  validateProductData: (data: ProductData): FormValidationResult => {
    const errors: ValidationError[] = [];

    // Validar nombre
    if (!data.name || !data.name.trim()) {
      errors.push({
        field: 'name',
        message: 'El nombre es requerido',
      });
    } else if (data.name.length > 100) {
      errors.push({
        field: 'name',
        message: 'El nombre no puede exceder 100 caracteres',
      });
    }

    // Validar categoría
    if (!data.categoryId) {
      errors.push({
        field: 'categoryId',
        message: 'La categoría es requerida',
      });
    }

    // Validar stock
    if (data.stock < 0) {
      errors.push({
        field: 'stock',
        message: 'El stock no puede ser negativo',
      });
    }

    // Validar precio
    if (!data.purchasePrice || data.purchasePrice <= 0) {
      errors.push({
        field: 'purchasePrice',
        message: 'El precio de compra debe ser mayor a 0',
      });
    }

    if (!data.salePrice || data.salePrice <= 0) {
      errors.push({
        field: 'salePrice',
        message: 'El precio de venta debe ser mayor a 0',
      });
    }

    // Validar stock mínimo
    if (data.minStock < 0) {
      errors.push({
        field: 'minStock',
        message: 'El stock mínimo no puede ser negativo',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Valida un archivo de imagen
   * @param file
   */
  validateImageFile: (file: File): { isValid: boolean; error?: string } => {
    // Validar tamaño
    if (file.size > IMAGE_CONFIG.MAX_SIZE) {
      return {
        isValid: false,
        error: `El archivo es muy grande. Máximo ${IMAGE_CONFIG.MAX_SIZE / (1024 * 1024)}MB.`,
      };
    }

    // Validar tipo
    if (
      !IMAGE_CONFIG.ACCEPTED_TYPES.includes(
        file.type as (typeof IMAGE_CONFIG.ACCEPTED_TYPES)[number]
      )
    ) {
      return {
        isValid: false,
        error: 'Solo se permiten archivos de imagen (JPG, PNG, WebP, GIF).',
      };
    }

    return { isValid: true };
  },

  /**
   * Valida una URL de imagen
   * @param url
   */
  validateImageUrl: (url: string): { isValid: boolean; error?: string } => {
    if (!url.trim()) {
      return {
        isValid: false,
        error: 'La URL de la imagen es requerida',
      };
    }

    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        error: 'La URL de la imagen no es válida',
      };
    }
  },
};

/**
 * Utilidades para el manejo de imágenes
 */
export const ImageUtils = {
  /**
   * Crea una URL de preview para un archivo
   * @param file
   */
  createPreviewUrl: (file: File): string => {
    return URL.createObjectURL(file);
  },

  /**
   * Libera una URL de preview
   * @param url
   */
  revokePreviewUrl: (url: string): void => {
    URL.revokeObjectURL(url);
  },

  /**
   * Convierte un archivo a base64
   * @param file
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string));
      reader.addEventListener('error', () => reject(reader.error));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Obtiene las dimensiones de una imagen
   * @param file
   */
  getImageDimensions: (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.addEventListener('load', () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      });

      img.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error al cargar la imagen'));
      });

      img.src = url;
    });
  },
};

/**
 * Utilidades para el manejo de errores
 */
export const ErrorUtils = {
  /**
   * Extrae el mensaje de error de diferentes tipos de error
   * @param error
   */
  getErrorMessage: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }

    return 'Error desconocido';
  },

  /**
   * Verifica si un error es de red
   * @param error
   */
  isNetworkError: (error: unknown): boolean => {
    return (
      error instanceof Error &&
      (error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch'))
    );
  },
};

/**
 * Utilidades para el formateo de datos
 */
export const FormatUtils = {
  /**
   * Formatea una fecha
   * @param date
   */
  formatDate: (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  /**
   * Formatea un número como moneda
   * @param amount
   */
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  },

  /**
   * Capitaliza la primera letra de una cadena
   * @param string_
   */
  capitalize: (string_: string): string => {
    return string_.charAt(0).toUpperCase() + string_.slice(1).toLowerCase();
  },

  /**
   * Trunca un texto a una longitud específica
   * @param text
   * @param maxLength
   */
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },
};
