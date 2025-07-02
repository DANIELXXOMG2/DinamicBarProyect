import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    const products = await prisma.product.findMany();
    const suppliers = await prisma.supplier.findMany();
    const purchases = await prisma.purchase.findMany({
      include: { items: true },
    });
    const sales = await prisma.sale.findMany({
      include: { items: true },
    });
    const cashRegisters = await prisma.cashRegister.findMany({
      include: { transactions: true },
    });
    const vouchers = await prisma.voucher.findMany();
    const store = await prisma.store.findFirst();
    const users = await prisma.user.findMany();
    const tableGroups = await prisma.tableGroup.findMany();
    const tables = await prisma.table.findMany({
      include: { items: true },
    });

    const backupData = {
      categories,
      products,
      suppliers,
      purchases,
      sales,
      cashRegisters,
      vouchers,
      store,
      users,
      tableGroups,
      tables,
      exportDate: new Date().toISOString(),
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-dinamicbar-${new Date().toISOString()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
