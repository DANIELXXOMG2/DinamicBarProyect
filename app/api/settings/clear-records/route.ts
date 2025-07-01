import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Deshabilitar temporalmente las restricciones de clave externa si es necesario
    // await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

    // Eliminar en un orden que respete las dependencias
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.purchaseItem.deleteMany({});
    await prisma.purchase.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.cashRegister.deleteMany({});
    await prisma.voucher.deleteMany({});

    // Volver a habilitar las restricciones de clave externa
    // await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

    return NextResponse.json({ message: 'Registros limpiados exitosamente' });
  } catch (error) {
    console.error('Error al limpiar los registros:', error);
    // Asegurarse de volver a habilitar las restricciones en caso de error
    // await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
