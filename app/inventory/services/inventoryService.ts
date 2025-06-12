import { Product, Category, NewProduct } from "../types/index"
import { API_ENDPOINTS } from "../constants"

export class InventoryService {
  static async getProducts(): Promise<Product[]> {
    const response = await fetch(API_ENDPOINTS.PRODUCTS)
    if (!response.ok) {
      throw new Error('Error al cargar productos')
    }
    const { products } = await response.json()
    return products
  }

  static async getCategories(): Promise<Category[]> {
    const response = await fetch(API_ENDPOINTS.CATEGORIES)
    if (!response.ok) {
      throw new Error('Error al cargar categorías')
    }
    const { categories } = await response.json()
    return categories
  }

  static async createProduct(product: NewProduct): Promise<Product> {
    const response = await fetch(API_ENDPOINTS.PRODUCTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al crear producto')
    }

    const { product: createdProduct } = await response.json()
    return createdProduct
  }

  static async updateStock(productId: string, action: 'increase' | 'decrease', quantity: number): Promise<Product> {
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        quantity
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al actualizar stock')
    }

    const { product } = await response.json()
    return product
  }

  static async updateProductImage(productId: string, imageUrl: string): Promise<Product> {
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateImage',
        image: imageUrl
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al actualizar imagen')
    }

    const { product } = await response.json()
    return product
  }

  static async removeProductImage(productId: string): Promise<Product> {
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'removeImage'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al eliminar imagen')
    }

    const { product } = await response.json()
    return product
  }

  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(API_ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Error al subir la imagen')
    }

    const { url } = await response.json()
    return url
  }

  static async verifyAdminPassword(password: string): Promise<boolean> {
    const response = await fetch(API_ENDPOINTS.AUTH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password
      })
    })

    return response.ok
  }
}