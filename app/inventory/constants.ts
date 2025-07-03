export const PRODUCT_TYPES = {
  NON_ALCOHOLIC: 'Sin Alcohol',
  ALCOHOLIC: 'Con Alcohol',
  FOOD: 'Comida',
} as const;

export const IMAGE_CONFIG = {
  ACCEPTED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as const,
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: 'image/*',
  PREVIEW_SIZE: {
    width: 128,
    height: 128,
  },
} as const;

export const STOCK_THRESHOLDS = {
  LOW_STOCK: 10,
  LOW_STOCK_WARNING: 0,
  MINIMUM_STOCK_DEFAULT: 0,
} as const;

export const API_ENDPOINTS = {
  PRODUCTS: '/api/inventory/products',
  CATEGORIES: '/api/inventory/categories',
  UPLOAD: '/api/upload',
  AUTH: '/api/auth/admin',
} as const;

export const FORM_VALIDATION = {
  REQUIRED_FIELDS: ['name', 'categoryId', 'salePrice'],
  MIN_PRICE: 0,
  MIN_STOCK: 0,
} as const;
