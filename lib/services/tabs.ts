import { prisma } from '@/lib/prisma'
import { Tab, TabItem, Product } from '@prisma/client'

export interface CreateTabData {
  name: string
}

export interface AddItemToTabData {
  tabId: string
  productId: string
  quantity: number
  price: number
}

export interface UpdateTabItemData {
  quantity: number
}

export interface UpdateTabData {
  name?: string
}

export interface TabWithItems extends Tab {
  items: (TabItem & {
    product: Product
  })[]
}

export class TabsService {
  // Obtener todas las mesas activas
  static async getActiveTabs(): Promise<TabWithItems[]> {
    try {
      return await prisma.tab.findMany({
        where: { isActive: true },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Error getting active tabs:', error)
      throw new Error('Error al obtener las mesas activas')
    }
  }

  // Obtener una mesa específica
  static async getTab(id: string): Promise<TabWithItems | null> {
    try {
      return await prisma.tab.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error getting tab:', error)
      throw new Error('Error al obtener la mesa')
    }
  }

  // Crear una nueva mesa
  static async createTab(data: CreateTabData): Promise<TabWithItems> {
    try {
      return await prisma.tab.create({
        data,
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error creating tab:', error)
      throw new Error('Error al crear la mesa')
    }
  }

  // Actualizar una mesa
  static async updateTab(id: string, data: UpdateTabData): Promise<TabWithItems> {
    try {
      const updatedTab = await prisma.tab.update({
        where: { id },
        data,
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
      return updatedTab
    } catch (error) {
      console.error('Error updating tab:', error)
      throw new Error('Error al actualizar la mesa')
    }
  }

  // Agregar item a una mesa
  static async addItemToTab(data: AddItemToTabData): Promise<TabWithItems> {
    try {
      // Verificar si el item ya existe en la mesa
      const existingItem = await prisma.tabItem.findUnique({
        where: {
          tabId_productId: {
            tabId: data.tabId,
            productId: data.productId
          }
        }
      })

      if (existingItem) {
        // Si existe, actualizar la cantidad
        await prisma.tabItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + data.quantity
          }
        })
      } else {
        // Si no existe, crear nuevo item
        await prisma.tabItem.create({
          data
        })
      }

      // Recalcular totales de la mesa
      await this.recalculateTabTotals(data.tabId)

      // Retornar la mesa actualizada
      const updatedTab = await this.getTab(data.tabId)
      if (!updatedTab) {
        throw new Error('Mesa no encontrada después de la actualización')
      }
      return updatedTab
    } catch (error) {
      console.error('Error adding item to tab:', error)
      throw new Error('Error al agregar item a la mesa')
    }
  }

  // Actualizar cantidad de un item en la mesa
  static async updateTabItem(tabId: string, productId: string, data: UpdateTabItemData): Promise<TabWithItems> {
    try {
      if (data.quantity <= 0) {
        // Si la cantidad es 0 o menor, eliminar el item
        await prisma.tabItem.delete({
          where: {
            tabId_productId: {
              tabId,
              productId
            }
          }
        })
      } else {
        // Actualizar la cantidad
        await prisma.tabItem.update({
          where: {
            tabId_productId: {
              tabId,
              productId
            }
          },
          data: {
            quantity: data.quantity
          }
        })
      }

      // Recalcular totales de la mesa
      await this.recalculateTabTotals(tabId)

      // Retornar la mesa actualizada
      const updatedTab = await this.getTab(tabId)
      if (!updatedTab) {
        throw new Error('Mesa no encontrada después de la actualización')
      }
      return updatedTab
    } catch (error) {
      console.error('Error updating tab item:', error)
      throw new Error('Error al actualizar item de la mesa')
    }
  }

  // Eliminar item de la mesa
  static async removeItemFromTab(tabId: string, productId: string): Promise<TabWithItems> {
    try {
      await prisma.tabItem.delete({
        where: {
          tabId_productId: {
            tabId,
            productId
          }
        }
      })

      // Recalcular totales de la mesa
      await this.recalculateTabTotals(tabId)

      // Retornar la mesa actualizada
      const updatedTab = await this.getTab(tabId)
      if (!updatedTab) {
        throw new Error('Mesa no encontrada después de la actualización')
      }
      return updatedTab
    } catch (error) {
      console.error('Error removing item from tab:', error)
      throw new Error('Error al eliminar item de la mesa')
    }
  }



  // Cerrar mesa (marcar como inactiva)
  static async closeTab(id: string): Promise<Tab> {
    try {
      return await prisma.tab.update({
        where: { id },
        data: { isActive: false }
      })
    } catch (error) {
      console.error('Error closing tab:', error)
      throw new Error('Error al cerrar la mesa')
    }
  }

  // Recalcular totales de la mesa
  private static async recalculateTabTotals(tabId: string): Promise<void> {
    try {
      const tab = await prisma.tab.findUnique({
        where: { id: tabId },
        include: { items: true }
      })

      if (!tab) {
        throw new Error('Mesa no encontrada')
      }

      const subtotal = tab.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)

      const total = subtotal

      await prisma.tab.update({
        where: { id: tabId },
        data: {
          subtotal,
          total
        }
      })
    } catch (error) {
      console.error('Error recalculating tab totals:', error)
      throw new Error('Error al recalcular totales de la mesa')
    }
  }

  // Obtener historial de mesas (cerradas)
  static async getTabHistory(limit: number = 50): Promise<TabWithItems[]> {
    try {
      return await prisma.tab.findMany({
        where: { isActive: false },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit
      })
    } catch (error) {
      console.error('Error getting tab history:', error)
      throw new Error('Error al obtener el historial de mesas')
    }
  }
}