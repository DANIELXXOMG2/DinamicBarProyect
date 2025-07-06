import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { BackupData } from '../types';

async function clearDatabase() {
  await prisma.$transaction([
    prisma.cashTransaction.deleteMany({}),
    prisma.tabItem.deleteMany({}),
    prisma.table.deleteMany({}),
    prisma.tableGroup.deleteMany({}),
    prisma.saleItem.deleteMany({}),
    prisma.sale.deleteMany({}),
    prisma.purchaseItem.deleteMany({}),
    prisma.purchase.deleteMany({}),
    prisma.product.deleteMany({}),
    prisma.category.deleteMany({}),
    prisma.supplier.deleteMany({}),
    prisma.cashRegister.deleteMany({}),
    prisma.voucher.deleteMany({}),
    prisma.store.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);
}

async function importSimpleModels(backupData: BackupData) {
  if (backupData.users)
    await prisma.user.createMany({ data: backupData.users });
  if (backupData.store) await prisma.store.create({ data: backupData.store });
  if (backupData.categories)
    await prisma.category.createMany({ data: backupData.categories });
  if (backupData.products)
    await prisma.product.createMany({ data: backupData.products });
  if (backupData.suppliers)
    await prisma.supplier.createMany({ data: backupData.suppliers });
  if (backupData.tableGroups)
    await prisma.tableGroup.createMany({ data: backupData.tableGroups });
  if (backupData.vouchers)
    await prisma.voucher.createMany({ data: backupData.vouchers });
}

async function importComplexModels(backupData: BackupData) {
  if (backupData.tables) {
    for (const { items, ...tableData } of backupData.tables) {
      const itemsToCreate = items.map(({ tableId: _tableId, ...item }) => item);
      await prisma.table.create({
        data: { ...tableData, items: { create: itemsToCreate } },
      });
    }
  }
  if (backupData.purchases) {
    for (const { items, ...purchaseData } of backupData.purchases) {
      const itemsToCreate = items.map(
        ({ purchaseId: _purchaseId, ...item }) => item
      );
      await prisma.purchase.create({
        data: { ...purchaseData, items: { create: itemsToCreate } },
      });
    }
  }
  if (backupData.sales) {
    for (const { items, ...saleData } of backupData.sales) {
      const itemsToCreate = items.map(({ saleId: _saleId, ...item }) => item);
      await prisma.sale.create({
        data: { ...saleData, items: { create: itemsToCreate } },
      });
    }
  }
  if (backupData.cashRegisters) {
    for (const {
      transactions,
      ...cashRegisterData
    } of backupData.cashRegisters) {
      const transactionsToCreate = transactions.map(
        ({ cashRegisterId: _cashRegisterId, ...transaction }) => transaction
      );
      await prisma.cashRegister.create({
        data: {
          ...cashRegisterData,
          transactions: { create: transactionsToCreate },
        },
      });
    }
  }
}

export async function POST(request: Request) {
  try {
    const backupData: BackupData = await request.json();

    await clearDatabase();
    await importSimpleModels(backupData);
    await importComplexModels(backupData);

    return NextResponse.json({ message: 'Datos importados exitosamente' });
  } catch (error) {
    console.error('Error importing data:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
