import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// Endpoint para cerrar una mesa
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tabId = params.id;
    const data = await request.json();

    // Validar datos recibidos
    if (!data.paymentMethod) {
      return NextResponse.json(
        { error: 'Se requiere método de pago' },
        { status: 400 }
      );
    }

    // Verificar si la mesa existe
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
      return NextResponse.json(
        { error: 'Mesa no encontrada' },
        { status: 404 }
      );
    }

    // Calcular el total
    const total = tab.items.reduce(
      (sum, item) => sum + item.product.salePrice * item.quantity,
      0
    );

    // Obtener la fecha actual
    const now = new Date();

    // Registrar el pago en la tabla de ventas
    const sale = await prisma.$executeRaw`
      INSERT INTO "sales" (
        id, 
        "tabId", 
        subtotal, 
        total, 
        "paymentMethod", 
        "createdAt", 
        "updatedAt"
      ) VALUES (
        gen_random_uuid(), 
        ${tabId}, 
        ${total}, 
        ${total}, 
        ${data.paymentMethod}, 
        ${now}, 
        ${now}
      ) RETURNING id
    `;

    // Registrar en transacciones
    await prisma.$executeRaw`
      INSERT INTO "transactions" (
        id, 
        type, 
        amount, 
        "paymentMethod", 
        description, 
        "createdAt", 
        "updatedAt"
      ) VALUES (
        gen_random_uuid(), 
        'SALE', 
        ${total}, 
        ${data.paymentMethod}, 
        ${`Cierre mesa ${tab.name}`}, 
        ${now},
        ${now}
      )
    `;

    // Actualizar la mesa como cerrada y limpiar los items
    await prisma.$transaction([
      // Eliminar items de la mesa
      prisma.$executeRaw`DELETE FROM "tab_items" WHERE "tabId" = ${tabId}`,

      // Actualizar estado de la mesa
      prisma.$executeRaw`
        UPDATE "tabs" 
        SET "isActive" = false, "updatedAt" = ${now}
        WHERE id = ${tabId}
      `,
    ]);

    return NextResponse.json({
      success: true,
      total,
      saleId: sale,
    });
  } catch (error) {
    console.error('Error closing tab:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
