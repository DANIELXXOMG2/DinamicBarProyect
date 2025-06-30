import { prisma } from '@/lib/prisma';

export interface CreatePurchaseData {
  supplierId: string;
  items: {
    productId?: string;
    quantity: number;
    purchasePrice: number;
    salePrice: number;
    iva?: number;
    total: number;
    newProductData?: {
      name: string;
      image?: string | null;
      categoryId: string;
      type: 'ALCOHOLIC' | 'NON_ALCOHOLIC';
    } | null;
  }[];
  subtotal: number;
  totalIva: number;
  grandTotal: number;
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER';
  companyImage?: string;
  date?: Date;
}

export interface UpdatePurchaseData {
  supplierId?: string;
  subtotal?: number;
  totalIva?: number;
  grandTotal?: number;
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER';
  companyImage?: string;
  date?: Date;
}

export const PurchasesService = {
  async getPurchases() {
    return await prisma.purchase.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getPurchase(id: string) {
    return await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: true,
      },
    });
  },

  async createPurchase(data: CreatePurchaseData) {
    return await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          supplierId: data.supplierId,
          subtotal: data.subtotal,
          totalIva: data.totalIva,
          grandTotal: data.grandTotal,
          paymentMethod: data.paymentMethod || 'CASH',
          companyImage: data.companyImage,
          date: data.date || new Date(),
        },
      });

      for (const item of data.items) {
        let productId = item.productId;

        // If it's a new product, create it first
        if (productId?.startsWith('new_') && item.newProductData) {
          const newProduct = await tx.product.create({
            data: {
              name: item.newProductData.name,
              image: item.newProductData.image,
              categoryId: item.newProductData.categoryId,
              type: item.newProductData.type,
              purchasePrice: item.purchasePrice,
              salePrice: item.salePrice,
              stock: 0, // Initial stock is 0 before this purchase
            },
          });
          productId = newProduct.id;
        }

        if (!productId) {
          throw new Error(`Product ID is missing for an item.`);
        }

        // Update stock and prices of the existing or newly created product
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: { increment: item.quantity },
            purchasePrice: item.purchasePrice,
            salePrice: item.salePrice,
          },
        });

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            salePrice: item.salePrice,
            iva: item.iva || 0,
            total: item.total,
          },
        });
      }

      return await tx.purchase.findUnique({
        where: { id: purchase.id },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  },

  async updatePurchase(id: string, data: UpdatePurchaseData) {
    return await prisma.purchase.update({
      where: { id },
      data,
      include: {
        supplier: true,
        items: true,
      },
    });
  },

  async deletePurchase(id: string): Promise<void> {
    // Primero obtener la compra con sus items para revertir el stock
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!purchase) {
      throw new Error('Compra no encontrada');
    }

    // Revertir el stock de los productos
    for (const item of purchase.items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // Eliminar la compra (los items se eliminan automáticamente por la relación en cascada)
    await prisma.purchase.delete({
      where: { id },
    });
  },

  async searchPurchasesBySupplier(supplierName: string) {
    return await prisma.purchase.findMany({
      where: {
        supplier: {
          name: {
            contains: supplierName,
            mode: 'insensitive',
          },
        },
      },
      include: {
        supplier: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getPurchasesByDateRange(startDate: Date, endDate: Date) {
    return await prisma.purchase.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        supplier: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
