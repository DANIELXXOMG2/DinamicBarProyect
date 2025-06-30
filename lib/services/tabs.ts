import type {
  Tab as PrismaTab,
  TabItem as PrismaTabItem,
  Product,
} from '@prisma/client';

export type TabItem = PrismaTabItem & {
  product: Product;
};

export type Tab = PrismaTab & {
  items: TabItem[];
};

import { prisma } from '@/lib/prisma';

export interface CreateTabData {
  name: string;
}

export interface AddItemToTabData {
  tabId: string;
  productId: string;
  quantity: number;
}

export interface UpdateTabItemData {
  quantity: number;
}

export interface UpdateTabData {
  name?: string;
}

export interface TabWithItems extends Tab {
  items: (TabItem & {
    product: Product;
  })[];
}

// Recalcular totales de la mesa
async function recalculateTabTotals(tabId: string): Promise<void> {
  try {
    const tab = await prisma.tab.findUnique({
      where: { id: tabId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!tab) {
      throw new Error('Mesa no encontrada');
    }

    const subtotal = tab.items.reduce((sum, item) => {
      return sum + item.product.salePrice * item.quantity;
    }, 0);

    const total = subtotal;

    await prisma.tab.update({
      where: { id: tabId },
      data: {
        subtotal,
        total,
      },
    });
  } catch (error) {
    console.error('Error recalculating tab totals:', error);
    throw new Error('Error al recalcular totales de la mesa');
  }
}

export async function getActiveTabs(): Promise<TabWithItems[]> {
  try {
    return await prisma.tab.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting active tabs:', error);
    throw new Error('Error al obtener las mesas activas');
  }
}

export async function getTab(id: string): Promise<TabWithItems | null> {
  try {
    return await prisma.tab.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error getting tab:', error);
    throw new Error('Error al obtener la mesa');
  }
}

export async function createTab(data: CreateTabData): Promise<TabWithItems> {
  try {
    return await prisma.tab.create({
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error creating tab:', error);
    throw new Error('Error al crear la mesa');
  }
}

export async function updateTab(
  id: string,
  data: UpdateTabData
): Promise<TabWithItems> {
  try {
    const updatedTab = await prisma.tab.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return updatedTab;
  } catch (error) {
    console.error('Error updating tab:', error);
    throw new Error('Error al actualizar la mesa');
  }
}

export async function addItemToTab(
  data: AddItemToTabData
): Promise<TabWithItems> {
  try {
    // Verificar si el item ya existe en la mesa
    const existingItem = await prisma.tabItem.findUnique({
      where: {
        tabId_productId: {
          tabId: data.tabId,
          productId: data.productId,
        },
      },
    });

    await (existingItem
      ? prisma.tabItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + data.quantity,
          },
        })
      : prisma.tabItem.create({ data }));

    // Recalcular totales de la mesa
    await recalculateTabTotals(data.tabId);

    // Retornar la mesa actualizada
    const updatedTab = await getTab(data.tabId);
    if (!updatedTab) {
      throw new Error('Mesa no encontrada después de la actualización');
    }
    return updatedTab;
  } catch (error) {
    console.error('Error adding item to tab:', error);
    throw new Error('Error al agregar item a la mesa');
  }
}

export async function updateTabItem(
  tabId: string,
  productId: string,
  data: UpdateTabItemData
): Promise<TabWithItems> {
  try {
    await (data.quantity <= 0
      ? prisma.tabItem.delete({
          where: {
            tabId_productId: {
              tabId,
              productId,
            },
          },
        })
      : prisma.tabItem.update({
          where: {
            tabId_productId: {
              tabId,
              productId,
            },
          },
          data: {
            quantity: data.quantity,
          },
        }));

    // Recalcular totales de la mesa
    await recalculateTabTotals(tabId);

    // Retornar la mesa actualizada
    const updatedTab = await getTab(tabId);
    if (!updatedTab) {
      throw new Error('Mesa no encontrada después de la actualización');
    }
    return updatedTab;
  } catch (error) {
    console.error('Error updating tab item:', error);
    throw new Error('Error al actualizar item de la mesa');
  }
}

export async function removeItemFromTab(
  tabId: string,
  productId: string
): Promise<TabWithItems> {
  try {
    await prisma.tabItem.delete({
      where: {
        tabId_productId: {
          tabId,
          productId,
        },
      },
    });

    // Recalcular totales de la mesa
    await recalculateTabTotals(tabId);

    // Retornar la mesa actualizada
    const updatedTab = await getTab(tabId);
    if (!updatedTab) {
      throw new Error('Mesa no encontrada después de la actualización');
    }
    return updatedTab;
  } catch (error) {
    console.error('Error removing item from tab:', error);
    throw new Error('Error al eliminar item de la mesa');
  }
}

export async function closeTab(id: string): Promise<Tab> {
  try {
    return await prisma.tab.update({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      where: { id },
      data: { isActive: false },
    });
  } catch (error) {
    console.error('Error closing tab:', error);
    throw new Error('Error al cerrar la mesa');
  }
}

export async function getTabHistory(limit = 50): Promise<TabWithItems[]> {
  try {
    return await prisma.tab.findMany({
      where: { isActive: false },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error getting tab history:', error);
    throw new Error('Error al obtener el historial de mesas');
  }
}
