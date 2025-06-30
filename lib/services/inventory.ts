import { Product, Category, ProductType } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export interface CreateProductData {
  name: string;
  salePrice: number;
  purchasePrice: number;
  stock: number;
  minStock?: number;
  type: ProductType;
  image?: string;
  categoryId: string;
}

export interface UpdateProductData {
  name?: string;
  salePrice?: number;
  purchasePrice?: number;
  stock?: number;
  minStock?: number;
  type?: ProductType;
  image?: string | null;
  categoryId?: string;
}

export interface CreateCategoryData {
  name: string;
  icon?: string;
  shortcut?: string;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export const InventoryService = {
  // Categorías
  async getCategories(): Promise<Category[]> {
    try {
      return await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Error al obtener las categorías');
    }
  },

  async createCategory(data: CreateCategoryData): Promise<Category> {
    try {
      return await prisma.category.create({ data });
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Error al crear la categoría');
    }
  },

  async updateCategory(
    id: string,
    data: Partial<CreateCategoryData>
  ): Promise<Category> {
    try {
      return await prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Error al actualizar la categoría');
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await prisma.category.delete({ where: { id } });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Error al eliminar la categoría');
    }
  },

  // Productos
  async getProductsWithSearch(
    searchTerm?: string
  ): Promise<ProductWithCategory[]> {
    try {
      return await prisma.product.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        include: { category: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error getting products with search:', error);
      throw new Error('Error al obtener los productos');
    }
  },

  async getProducts(): Promise<ProductWithCategory[]> {
    try {
      return await prisma.product.findMany({
        include: { category: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Error al obtener los productos');
    }
  },

  async getProductsByCategory(
    categoryId: string
  ): Promise<ProductWithCategory[]> {
    try {
      return await prisma.product.findMany({
        where: { categoryId },
        include: { category: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw new Error('Error al obtener los productos por categoría');
    }
  },

  async getProduct(id: string): Promise<ProductWithCategory | null> {
    try {
      return await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Error al obtener el producto');
    }
  },

  async createProduct(data: CreateProductData): Promise<ProductWithCategory> {
    try {
      return await prisma.product.create({
        data,
        include: { category: true },
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Error al crear el producto');
    }
  },

  async updateProduct(
    id: string,
    data: UpdateProductData
  ): Promise<ProductWithCategory> {
    try {
      return await prisma.product.update({
        where: { id },
        data,
        include: { category: true },
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Error al actualizar el producto');
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await prisma.product.delete({ where: { id } });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Error al eliminar el producto');
    }
  },

  // Gestión de stock
  async updateStock(
    id: string,
    quantity: number
  ): Promise<ProductWithCategory> {
    try {
      return await prisma.product.update({
        where: { id },
        data: { stock: quantity },
        include: { category: true },
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error('Error al actualizar el stock');
    }
  },

  async decreaseStock(
    id: string,
    quantity: number
  ): Promise<ProductWithCategory> {
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const newStock = Math.max(0, product.stock - quantity);
      return await prisma.product.update({
        where: { id },
        data: { stock: newStock },
        include: { category: true },
      });
    } catch (error) {
      console.error('Error decreasing stock:', error);
      throw new Error('Error al reducir el stock');
    }
  },

  async increaseStock(
    id: string,
    quantity: number
  ): Promise<ProductWithCategory> {
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const newStock = product.stock + quantity;
      return await prisma.product.update({
        where: { id },
        data: { stock: newStock },
        include: { category: true },
      });
    } catch (error) {
      console.error('Error increasing stock:', error);
      throw new Error('Error al aumentar el stock');
    }
  },

  // Productos con stock bajo
  async getLowStockProducts(): Promise<ProductWithCategory[]> {
    try {
      return await prisma.product.findMany({
        where: {
          OR: [
            { stock: { lte: prisma.product.fields.minStock } },
            { AND: [{ minStock: undefined }, { stock: { lte: 5 } }] },
          ],
        },
        include: { category: true },
        orderBy: { stock: 'asc' },
      });
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw new Error('Error al obtener productos con stock bajo');
    }
  },
};
