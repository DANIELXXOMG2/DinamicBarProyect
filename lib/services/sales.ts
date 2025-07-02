import { Sale, SaleItem, PaymentMethod } from '@prisma/client';

import { CashRegisterService } from './cash-register';
import { getTable, TabItem } from './tables';
import { prisma } from '@/lib/prisma';

export interface CreateSaleData {
  tableId: string;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
}

export interface SaleWithItems extends Sale {
  items: SaleItem[];
}

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  salesByPaymentMethod: {
    cash: number;
    card: number;
    transfer: number;
  };
  topProducts: {
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  salesByHour: {
    hour: number;
    count: number;
    revenue: number;
  }[];
}

export const SalesService = {
  // Procesar venta de una mesa
  async processSale(data: CreateSaleData): Promise<SaleWithItems> {
    try {
      // Obtener la mesa con sus items
      const tab = await getTable(data.tableId);
      if (!tab) {
        throw new Error('Mesa no encontrada');
      }

      if (!tab.isActive) {
        throw new Error('La mesa ya está cerrada');
      }

      if (tab.items.length === 0) {
        throw new Error('La mesa no tiene productos');
      }

      // Verificar que hay una caja abierta
      const cashRegister = await CashRegisterService.getCurrentCashRegister();
      if (!cashRegister) {
        // Si no hay caja, descontar stock, cerrar mesa y avisar
        await prisma.$transaction(async (tx) => {
          // Actualizar stock de productos
          await Promise.all(
            tab.items.map((item: TabItem) =>
              tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              })
            )
          );

          // Cerrar la mesa
          await tx.table.update({
            where: { id: data.tableId },
            data: { isActive: false },
          });
        });

        throw new Error(
          'Inventario actualizado y mesa cerrada, pero no se generó la venta por falta de caja abierta.'
        );
      }

      // Calcular totales
      const subtotal = tab.subtotal;
      const total = subtotal;
      const change =
        data.paymentMethod === PaymentMethod.CASH && data.cashReceived
          ? Math.max(0, data.cashReceived - total)
          : 0;

      // Validar pago en efectivo
      if (
        data.paymentMethod === PaymentMethod.CASH &&
        (!data.cashReceived || data.cashReceived < total)
      ) {
        throw new Error('El monto recibido es insuficiente');
      }

      // Crear la venta en una transacción
      const sale = await prisma.$transaction(async (tx) => {
        // Crear la venta
        const newSale = await tx.sale.create({
          data: {
            tableId: data.tableId,
            subtotal,
            tip: 0,
            total,
            paymentMethod: data.paymentMethod,
            cashReceived: data.cashReceived,
            change,
            cashRegisterId: cashRegister.id,
          },
        });

        // Crear los items de la venta
        const saleItems = await Promise.all(
          tab.items.map((item: TabItem) =>
            tx.saleItem.create({
              data: {
                saleId: newSale.id,
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: item.product.salePrice,
                totalPrice: item.product.salePrice * item.quantity,
              },
            })
          )
        );

        // Actualizar stock de productos
        await Promise.all(
          tab.items.map((item: TabItem) =>
            tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          )
        );

        // Cerrar la mesa
        await tx.table.update({
          where: { id: data.tableId },
          data: { isActive: false },
        });

        // Actualizar totales de la caja registradora
        const newTotalSales = cashRegister.totalSales + total;
        const newTotalCash =
          data.paymentMethod === PaymentMethod.CASH
            ? cashRegister.totalCash + total
            : cashRegister.totalCash;
        const newTotalCard =
          data.paymentMethod === PaymentMethod.CARD
            ? cashRegister.totalCard + total
            : cashRegister.totalCard;

        await tx.cashRegister.update({
          where: { id: cashRegister.id },
          data: {
            totalSales: newTotalSales,
            totalCash: newTotalCash,
            totalCard: newTotalCard,
          },
        });

        return {
          ...newSale,
          items: saleItems,
        };
      });

      return sale;
    } catch (error) {
      console.error('Error processing sale:', error);
      throw new Error('Error al procesar la venta');
    }
  },

  // Obtener todas las ventas
  async getSales(limit = 50): Promise<SaleWithItems[]> {
    try {
      return await prisma.sale.findMany({
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Error getting sales:', error);
      throw new Error('Error al obtener las ventas');
    }
  },

  // Obtener venta por ID
  async getSale(id: string): Promise<SaleWithItems | null> {
    try {
      return await prisma.sale.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });
    } catch (error) {
      console.error('Error getting sale:', error);
      throw new Error('Error al obtener la venta');
    }
  },

  // Obtener ventas por rango de fechas
  async getSalesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<SaleWithItems[]> {
    try {
      return await prisma.sale.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error getting sales by date range:', error);
      throw new Error('Error al obtener las ventas por rango de fechas');
    }
  },

  // Generar reporte de ventas
  async generateSalesReport(
    startDate: Date,
    endDate: Date
  ): Promise<SalesReport> {
    try {
      const sales = await this.getSalesByDateRange(startDate, endDate);

      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

      // Ventas por método de pago
      const salesByPaymentMethod = {
        cash: sales.filter((s) => s.paymentMethod === PaymentMethod.CASH)
          .length,
        card: sales.filter((s) => s.paymentMethod === PaymentMethod.CARD)
          .length,
        transfer: sales.filter(
          (s) => s.paymentMethod === PaymentMethod.TRANSFER
        ).length,
      };

      // Productos más vendidos
      const productSales = new Map<
        string,
        { quantity: number; revenue: number }
      >();

      for (const sale of sales) {
        for (const item of sale.items) {
          const existing = productSales.get(item.productName) || {
            quantity: 0,
            revenue: 0,
          };
          productSales.set(item.productName, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.totalPrice,
          });
        }
      }

      const topProducts = [...productSales.entries()]
        .map(([productName, data]) => ({ productName, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Ventas por hora
      const salesByHour = Array.from({ length: 24 }, (_, hour) => {
        const hourSales = sales.filter(
          (sale) => new Date(sale.createdAt).getHours() === hour
        );
        return {
          hour,
          count: hourSales.length,
          revenue: hourSales.reduce((sum, sale) => sum + sale.total, 0),
        };
      });

      return {
        totalSales,
        totalRevenue,
        salesByPaymentMethod,
        topProducts,
        salesByHour,
      };
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw new Error('Error al generar el reporte de ventas');
    }
  },

  // Obtener ventas del día actual
  async getTodaySales(): Promise<SaleWithItems[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      return await this.getSalesByDateRange(startOfDay, endOfDay);
    } catch (error) {
      console.error('Error getting today sales:', error);
      throw new Error('Error al obtener las ventas del día');
    }
  },

  // Cancelar venta (solo si la caja sigue abierta)
  async cancelSale(saleId: string, reason: string): Promise<void> {
    try {
      const sale = await this.getSale(saleId);
      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      const cashRegister = await CashRegisterService.getCurrentCashRegister();
      if (!cashRegister || cashRegister.id !== sale.cashRegisterId) {
        throw new Error(
          'No se puede cancelar la venta. La caja registradora está cerrada.'
        );
      }

      await prisma.$transaction(async (tx) => {
        // Restaurar stock de productos
        await Promise.all(
          sale.items.map((item) =>
            tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })
          )
        );

        // Reactivar la mesa
        await tx.table.update({
          where: { id: sale.tableId! },
          data: { isActive: true },
        });

        // Actualizar totales de la caja registradora
        const newTotalSales = cashRegister.totalSales - sale.total;
        const newTotalCash =
          sale.paymentMethod === PaymentMethod.CASH
            ? cashRegister.totalCash - sale.total
            : cashRegister.totalCash;
        const newTotalCard =
          sale.paymentMethod === PaymentMethod.CARD
            ? cashRegister.totalCard - sale.total
            : cashRegister.totalCard;

        await tx.cashRegister.update({
          where: { id: cashRegister.id },
          data: {
            totalSales: newTotalSales,
            totalCash: newTotalCash,
            totalCard: newTotalCard,
          },
        });

        // Eliminar la venta
        await tx.sale.delete({
          where: { id: saleId },
        });

        // Registrar transacción de cancelación
        await tx.cashTransaction.create({
          data: {
            type: 'EXPENSE',
            amount: sale.total,
            description: `Cancelación de venta - ${reason}`,
            cashRegisterId: cashRegister.id,
          },
        });
      });
    } catch (error) {
      console.error('Error canceling sale:', error);
      throw new Error('Error al cancelar la venta');
    }
  },
};
