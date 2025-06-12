import { prisma } from '@/lib/prisma'
import { Store } from '@prisma/client'

export interface CreateStoreData {
  name: string
  phone?: string
  image?: string | null
  address?: string
}

export interface UpdateStoreData {
  name?: string
  phone?: string
  image?: string | null
  address?: string
}

export class StoreService {
  // Obtener la información del local (solo debe haber uno)
  static async getStore(): Promise<Store | null> {
    try {
      const store = await prisma.store.findFirst()
      return store
    } catch (error) {
      console.error('Error getting store:', error)
      throw new Error('Error al obtener la información del local')
    }
  }

  // Crear la información del local
  static async createStore(data: CreateStoreData): Promise<Store> {
    try {
      // Verificar que no exista ya un local
      const existingStore = await prisma.store.findFirst()
      if (existingStore) {
        throw new Error('Ya existe información del local. Use updateStore para actualizar.')
      }

      const store = await prisma.store.create({
        data
      })
      return store
    } catch (error) {
      console.error('Error creating store:', error)
      throw new Error('Error al crear la información del local')
    }
  }

  // Actualizar la información del local
  static async updateStore(data: UpdateStoreData): Promise<Store> {
    try {
      const existingStore = await prisma.store.findFirst()
      if (!existingStore) {
        throw new Error('No existe información del local. Use createStore para crear.')
      }

      const store = await prisma.store.update({
        where: { id: existingStore.id },
        data
      })
      return store
    } catch (error) {
      console.error('Error updating store:', error)
      throw new Error('Error al actualizar la información del local')
    }
  }

  // Crear o actualizar la información del local
  static async upsertStore(data: CreateStoreData): Promise<Store> {
    try {
      const existingStore = await prisma.store.findFirst()
      
      if (existingStore) {
        return await this.updateStore(data)
      } else {
        return await this.createStore(data)
      }
    } catch (error) {
      console.error('Error upserting store:', error)
      throw new Error('Error al guardar la información del local')
    }
  }
}