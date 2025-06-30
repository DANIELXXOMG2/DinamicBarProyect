import { CashRegister, CashTransaction, TransactionType } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export interface OpenCashRegisterData {
  openingAmount: number;
  openedBy?: string;
  notes?: string;
}

export interface CloseCashRegisterData {
  closingAmount: number;
  closedBy?: string;
  notes?: string;
}

export interface CreateTransactionData {
  type: TransactionType;
  amount: number;
  description: string;
  createdBy?: string;
}

export interface CashRegisterWithTransactions extends CashRegister {
  transactions: CashTransaction[];
}

export interface CashRegisterSummary {
  register: CashRegister;
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  expectedCash: number;
  difference: number;
}

export const CashRegisterService = {
  // Obtener la caja registradora actual (abierta)
  async getCurrentCashRegister(): Promise<CashRegisterWithTransactions | null> {
    try {
      return await prisma.cashRegister.findFirst({
        where: { isOpen: true },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      console.error('Error getting current cash register:', error);
      throw new Error('Error al obtener la caja registradora actual');
    }
  },

  // Abrir una nueva caja registradora
  async openCashRegister(data: OpenCashRegisterData): Promise<CashRegister> {
    try {
      // Verificar que no haya una caja abierta
      const currentRegister = await this.getCurrentCashRegister();
      if (currentRegister) {
        throw new Error(
          'Ya hay una caja registradora abierta. Debe cerrarla primero.'
        );
      }

      // Crear nueva caja registradora
      const cashRegister = await prisma.cashRegister.create({
        data: {
          openingAmount: data.openingAmount,
          openedBy: data.openedBy,
          notes: data.notes,
          totalCash: data.openingAmount,
        },
      });

      // Crear transacción de apertura
      await prisma.cashTransaction.create({
        data: {
          type: TransactionType.OPENING,
          amount: data.openingAmount,
          description: 'Apertura de caja',
          cashRegisterId: cashRegister.id,
          createdBy: data.openedBy,
        },
      });

      return cashRegister;
    } catch (error) {
      console.error('Error opening cash register:', error);
      throw new Error('Error al abrir la caja registradora');
    }
  },

  // Cerrar la caja registradora actual
  async closeCashRegister(
    data: CloseCashRegisterData
  ): Promise<CashRegisterSummary> {
    try {
      const currentRegister = await this.getCurrentCashRegister();
      if (!currentRegister) {
        throw new Error('No hay una caja registradora abierta');
      }

      // Calcular totales
      const summary = await this.getCashRegisterSummary(currentRegister.id);

      // Cerrar la caja
      const closedRegister = await prisma.cashRegister.update({
        where: { id: currentRegister.id },
        data: {
          isOpen: false,
          closingAmount: data.closingAmount,
          closedAt: new Date(),
          closedBy: data.closedBy,
          notes: data.notes,
        },
      });

      // Crear transacción de cierre
      await prisma.cashTransaction.create({
        data: {
          type: TransactionType.CLOSING,
          amount: data.closingAmount,
          description: 'Cierre de caja',
          cashRegisterId: currentRegister.id,
          createdBy: data.closedBy,
        },
      });

      return {
        ...summary,
        register: closedRegister,
        difference: data.closingAmount - summary.expectedCash,
      };
    } catch (error) {
      console.error('Error closing cash register:', error);
      throw new Error('Error al cerrar la caja registradora');
    }
  },

  // Agregar transacción a la caja actual
  async addTransaction(data: CreateTransactionData): Promise<CashTransaction> {
    try {
      const currentRegister = await this.getCurrentCashRegister();
      if (!currentRegister) {
        throw new Error('No hay una caja registradora abierta');
      }

      const transaction = await prisma.cashTransaction.create({
        data: {
          ...data,
          cashRegisterId: currentRegister.id,
        },
      });

      // Actualizar totales de la caja
      const newTotalCash =
        data.type === TransactionType.INCOME
          ? currentRegister.totalCash + data.amount
          : currentRegister.totalCash - data.amount;

      await prisma.cashRegister.update({
        where: { id: currentRegister.id },
        data: { totalCash: newTotalCash },
      });

      return transaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw new Error('Error al agregar la transacción');
    }
  },

  // Obtener resumen de la caja registradora
  async getCashRegisterSummary(
    registerId: string
  ): Promise<CashRegisterSummary> {
    try {
      const register = await prisma.cashRegister.findUnique({
        where: { id: registerId },
        include: {
          transactions: true,
          sales: true,
        },
      });

      if (!register) {
        throw new Error('Caja registradora no encontrada');
      }

      const totalTransactions = register.transactions.length;
      const totalIncome = register.transactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = register.transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      const expectedCash =
        register.openingAmount +
        register.totalSales +
        totalIncome -
        totalExpenses;

      return {
        register,
        totalTransactions,
        totalIncome,
        totalExpenses,
        expectedCash,
        difference: register.closingAmount
          ? register.closingAmount - expectedCash
          : 0,
      };
    } catch (error) {
      console.error('Error getting cash register summary:', error);
      throw new Error('Error al obtener el resumen de la caja registradora');
    }
  },

  // Obtener historial de cajas registradoras
  async getCashRegisterHistory(limit = 10): Promise<CashRegister[]> {
    try {
      return await prisma.cashRegister.findMany({
        orderBy: { openedAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Error getting cash register history:', error);
      throw new Error('Error al obtener el historial de cajas registradoras');
    }
  },

  // Obtener transacciones de una caja específica
  async getCashRegisterTransactions(
    registerId: string
  ): Promise<CashTransaction[]> {
    try {
      return await prisma.cashTransaction.findMany({
        where: { cashRegisterId: registerId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error getting cash register transactions:', error);
      throw new Error(
        'Error al obtener las transacciones de la caja registradora'
      );
    }
  },

  // Verificar si hay una caja abierta
  async isCashRegisterOpen(): Promise<boolean> {
    try {
      const currentRegister = await this.getCurrentCashRegister();
      return currentRegister !== null;
    } catch (error) {
      console.error('Error checking if cash register is open:', error);
      return false;
    }
  },
};
