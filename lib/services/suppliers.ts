import { Supplier } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export interface CreateSupplierData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  image?: string;
}

export interface UpdateSupplierData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  image?: string;
}

export const SuppliersService = {
  // Obtener todos los proveedores
  async getSuppliers(): Promise<Supplier[]> {
    try {
      return await prisma.supplier.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error getting suppliers:', error);
      throw new Error('Error al obtener los proveedores');
    }
  },

  // Obtener un proveedor específico
  async getSupplier(id: string): Promise<Supplier | null> {
    try {
      return await prisma.supplier.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error getting supplier:', error);
      throw new Error('Error al obtener el proveedor');
    }
  },

  // Crear un nuevo proveedor
  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    try {
      return await prisma.supplier.create({
        data,
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error('Error al crear el proveedor');
    }
  },

  // Actualizar un proveedor
  async updateSupplier(
    id: string,
    data: UpdateSupplierData
  ): Promise<Supplier> {
    try {
      return await prisma.supplier.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error('Error al actualizar el proveedor');
    }
  },

  // Eliminar un proveedor
  async deleteSupplier(id: string): Promise<void> {
    try {
      await prisma.supplier.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error('Error al eliminar el proveedor');
    }
  },

  // Buscar proveedores por nombre
  async searchSuppliers(query: string): Promise<Supplier[]> {
    try {
      return await prisma.supplier.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw new Error('Error al buscar proveedores');
    }
  },
};
