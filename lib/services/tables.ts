import type {
  Table as PrismaTable,
  TabItem as PrismaTabItem,
  Product,
  TableGroup as PrismaTableGroup,
} from '@prisma/client';

export type TabItem = PrismaTabItem & {
  product: Product;
};

export type Table = PrismaTable;

export type TableWithRelations = PrismaTable & {
  tabs: {
    items: (PrismaTabItem & {
      product: Product;
    })[];
  }[];
};

export type TableGroup = PrismaTableGroup & {
  tables: (PrismaTable & { items: TabItem[] })[];
};

import { prisma } from '@/lib/prisma';

export interface CreateTableData {
  name: string;
  tableGroupId?: string;
}

export interface AddItemToTableData {
  tableId: string;
  productId: string;
  quantity: number;
}

export interface UpdateTabItemData {
  quantity: number;
}

export interface UpdateTableData {
  name?: string;
  positionX?: number;
  positionY?: number;
  tableGroupId?: string;
}

export interface TableWithItems extends Table {
  items: (TabItem & {
    product: Product;
  })[];
}

// Recalcular totales de la mesa
async function recalculateTableTotals(tableId: string): Promise<void> {
  try {
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!table) {
      throw new Error('Mesa no encontrada');
    }

    const subtotal = table.items.reduce((sum, item) => {
      return sum + item.product.salePrice * item.quantity;
    }, 0);

    const total = subtotal;

    await prisma.table.update({
      where: { id: tableId },
      data: {
        subtotal,
        total,
      },
    });
  } catch (error) {
    console.error('Error recalculating table totals:', error);
    throw new Error('Error al recalcular totales de la mesa');
  }
}

export async function getTableGroupsWithTables(): Promise<TableGroup[]> {
  try {
    const groups = await prisma.tableGroup.findMany({
      include: {
        tables: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return groups;
  } catch (error) {
    console.error('Error getting table groups:', error);
    throw new Error('Error al obtener los grupos de mesas');
  }
}

export async function createTableGroup(name: string): Promise<TableGroup> {
  try {
    const newGroup = await prisma.tableGroup.create({ data: { name } });
    return { ...newGroup, tables: [] };
  } catch (error) {
    console.error('Error creating table group:', error);
    throw new Error('Error al crear el grupo de mesas');
  }
}

export async function updateTableGroup(
  id: string,
  name: string
): Promise<TableGroup> {
  try {
    return await prisma.tableGroup.update({
      where: { id },
      data: { name },
      include: {
        tables: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error updating table group:', error);
    throw new Error('Error al actualizar el grupo de mesas');
  }
}

export async function deleteTableGroup(id: string): Promise<void> {
  try {
    await prisma.tableGroup.delete({ where: { id } });
  } catch (error) {
    console.error('Error deleting table group:', error);
    throw new Error('Error al eliminar el grupo de mesas');
  }
}

export async function getActiveTables(): Promise<TableWithItems[]> {
  try {
    return await prisma.table.findMany({
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
    console.error('Error getting active tables:', error);
    throw new Error('Error al obtener las mesas activas');
  }
}

export async function getTable(id: string): Promise<TableWithItems | null> {
  try {
    return await prisma.table.findUnique({
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
    console.error('Error getting table:', error);
    throw new Error('Error al obtener la mesa');
  }
}

export async function createTable(
  data: CreateTableData
): Promise<TableWithItems> {
  try {
    return await prisma.table.create({
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
    console.error('Error creating table:', error);
    throw new Error('Error al crear la mesa');
  }
}

export async function updateTable(
  id: string,
  data: UpdateTableData
): Promise<TableWithItems> {
  try {
    const updatedTable = await prisma.table.update({
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
    return updatedTable;
  } catch (error) {
    console.error('Error updating table:', error);
    throw new Error('Error al actualizar la mesa');
  }
}

export async function addItemToTable(
  data: AddItemToTableData
): Promise<TableWithItems> {
  try {
    const existingItem = await prisma.tabItem.findUnique({
      where: {
        tableId_productId: {
          tableId: data.tableId,
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

    await recalculateTableTotals(data.tableId);

    const updatedTable = await getTable(data.tableId);
    if (!updatedTable) {
      throw new Error('Mesa no encontrada después de la actualización');
    }
    return updatedTable;
  } catch (error) {
    console.error('Error adding item to table:', error);
    throw new Error('Error al agregar item a la mesa');
  }
}

export async function updateTabItem(
  tableId: string,
  productId: string,
  data: UpdateTabItemData
): Promise<TableWithItems> {
  try {
    await (data.quantity <= 0
      ? prisma.tabItem.delete({
          where: {
            tableId_productId: {
              tableId,
              productId,
            },
          },
        })
      : prisma.tabItem.update({
          where: {
            tableId_productId: {
              tableId,
              productId,
            },
          },
          data,
        }));

    await recalculateTableTotals(tableId);

    const updatedTable = await getTable(tableId);
    if (!updatedTable) {
      throw new Error('Mesa no encontrada después de la actualización');
    }
    return updatedTable;
  } catch (error) {
    console.error('Error updating tab item:', error);
    throw new Error('Error al actualizar item de la mesa');
  }
}

export async function deleteTable(id: string): Promise<void> {
  try {
    await prisma.table.delete({ where: { id } });
  } catch (error) {
    console.error('Error deleting table:', error);
    throw new Error('Error al eliminar la mesa');
  }
}

export async function getActiveTablesWithItems(): Promise<TableWithItems[]> {
  try {
    return await prisma.table.findMany({
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
    console.error('Error getting active tables with items:', error);
    throw new Error('Error al obtener las mesas activas con items');
  }
}

export async function closeTable(id: string): Promise<Table> {
  try {
    return await prisma.table.update({
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
    console.error('Error closing table:', error);
    throw new Error('Error al cerrar la mesa');
  }
}

export async function getTableHistory(limit = 50): Promise<TableWithItems[]> {
  try {
    return await prisma.table.findMany({
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
    console.error('Error getting table history:', error);
    throw new Error('Error al obtener el historial de mesas');
  }
}
