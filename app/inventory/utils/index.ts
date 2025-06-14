import { Product, ValidationError, FormValidationResult } from '../types/index'
import { STOCK_THRESHOLDS, FORM_VALIDATION, IMAGE_CONFIG } from '../constants'

/**
 * Utilidades para el manejo de productos
 */
export const ProductUtils = {
  /**
   * Verifica si un producto tiene stock bajo
   */
  isLowStock: (product: Product): boolean => {
    return product.stock <= Math.max(product.minStock || 0, STOCK_THRESHOLDS.LOW_STOCK)
  },

  /**
   * Calcula el valor total de un producto (stock * precio)
   */
  getTotalValue: (product: Product): number => {
    return product.stock * product.purchasePrice
  },

  /**
   * Obtiene el estado del stock como string
   */
  getStockStatus: (product: Product): 'low' | 'normal' => {
    return ProductUtils.isLowStock(product) ? 'low' : 'normal'
  },

  /**
   * Formatea el precio como moneda
   */
  formatPrice: (price: number): string => {
    return `$${price.toFixed(2)}`
  },

  /**
   * Filtra productos por categoría y búsqueda
   */
  filterProducts: (
    products: Product[],
    categoryFilter: string,
    searchQuery: string
  ): Product[] => {
    return products.filter(product => {
      const matchesCategory = !categoryFilter || product.categoryId === categoryFilter
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesSearch
    })
  },

  /**
   * Obtiene el conteo de productos por categoría
   */
  getProductCountByCategory: (products: Product[]): Record<string, number> => {
    return products.reduce((acc, product) => {
      acc[product.categoryId] = (acc[product.categoryId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

/**
 * Utilidades para validación de formularios
 */
export const ValidationUtils = {
  /**
   * Valida los datos de un nuevo producto
   */
  validateProductData: (data: any): FormValidationResult => {
    const errors: ValidationError[] = []

    // Validar nombre
    if (!data.name || !data.name.trim()) {
      errors.push({
        field: 'name',
        message: 'El nombre es requerido'
      })
    } else if (data.name.length > 100) {
        errors.push({
          field: 'name',
          message: 'El nombre no puede exceder 100 caracteres'
        })
    }

    // Validar categoría
    if (!data.categoryId) {
      errors.push({
        field: 'categoryId',
        message: 'La categoría es requerida'
      })
    }

    // Validar stock
    if (data.stock < 0) {
      errors.push({
        field: 'stock',
        message: 'El stock no puede ser negativo'
      })
    }

    // Validar precio
    if (!data.purchasePrice || data.purchasePrice <= 0) {
      errors.push({ field: 'purchasePrice', message: 'El precio de compra debe ser mayor a 0' })
    }
    
    if (!data.salePrice || data.salePrice <= 0) {
      errors.push({ field: 'salePrice', message: 'El precio de venta debe ser mayor a 0' })
    }

    // Validar stock mínimo
    if (data.minStock < 0) {
      errors.push({
        field: 'minStock',
        message: 'El stock mínimo no puede ser negativo'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Valida un archivo de imagen
   */
  validateImageFile: (file: File): { isValid: boolean; error?: string } => {
    // Validar tamaño
    if (file.size > IMAGE_CONFIG.MAX_SIZE) {
      return {
        isValid: false,
        error: `El archivo es muy grande. Máximo ${IMAGE_CONFIG.MAX_SIZE / (1024 * 1024)}MB.`
      }
    }

    // Validar tipo
    if (!IMAGE_CONFIG.ACCEPTED_TYPES.includes(file.type as typeof IMAGE_CONFIG.ACCEPTED_TYPES[number])) {
      return {
        isValid: false,
        error: 'Solo se permiten archivos de imagen (JPG, PNG, WebP, GIF).'
      }
    }

    return { isValid: true }
  },

  /**
   * Valida una URL de imagen
   */
  validateImageUrl: (url: string): { isValid: boolean; error?: string } => {
    if (!url.trim()) {
      return {
        isValid: false,
        error: 'La URL de la imagen es requerida'
      }
    }

    try {
      new URL(url)
      return { isValid: true }
    } catch {
      return {
        isValid: false,
        error: 'La URL de la imagen no es válida'
      }
    }
  }
}

/**
 * Utilidades para el manejo de imágenes
 */
export const ImageUtils = {
  /**
   * Crea una URL de preview para un archivo
   */
  createPreviewUrl: (file: File): string => {
    return URL.createObjectURL(file)
  },

  /**
   * Libera una URL de preview
   */
  revokePreviewUrl: (url: string): void => {
    URL.revokeObjectURL(url)
  },

  /**
   * Convierte un archivo a base64
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },

  /**
   * Obtiene las dimensiones de una imagen
   */
  getImageDimensions: (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.width, height: img.height })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Error al cargar la imagen'))
      }
      
      img.src = url
    })
  }
}

/**
 * Utilidades para el manejo de errores
 */
export const ErrorUtils = {
  /**
   * Extrae el mensaje de error de diferentes tipos de error
   */
  getErrorMessage: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }
    
    return 'Error desconocido'
  },

  /**
   * Verifica si un error es de red
   */
  isNetworkError: (error: unknown): boolean => {
    return error instanceof Error && 
           (error.message.includes('fetch') || 
            error.message.includes('network') ||
            error.message.includes('Failed to fetch'))
  }
}

/**
 * Utilidades para el formateo de datos
 */
export const FormatUtils = {
  /**
   * Formatea una fecha
   */
  formatDate: (date: string | Date): string => {
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  },

  /**
   * Formatea un número como moneda
   */
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  },

  /**
   * Capitaliza la primera letra de una cadena
   */
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  /**
   * Trunca un texto a una longitud específica
   */
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }
}