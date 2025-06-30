import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// Endpoint para procesar la división de cuenta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tabId } = await params;
    const data = await request.json();

    // Validar datos recibidos
    if (
      !data.paidItems ||
      !Array.isArray(data.paidItems) ||
      data.paidItems.length === 0
    ) {
      return NextResponse.json(
        { error: 'Se requieren productos para procesar el pago' },
        { status: 400 }
      );
    }

    if (!data.paymentMethod) {
      return NextResponse.json(
        { error: 'Se requiere método de pago' },
        { status: 400 }
      );
    }

    // Verificar si la mesa existe
    const tab = await prisma.tab.findUnique({
      where: { id: tabId },
      include: { items: true },
    });

    if (!tab) {
      return NextResponse.json(
        { error: 'Mesa no encontrada' },
        { status: 404 }
      );
    }

    // Obtener la fecha actual
    const now = new Date();

    // Registrar el pago parcial usando consulta directa
    const paymentId = await prisma.$executeRaw`
      INSERT INTO "payments" (
        id, 
        "tabId", 
        amount, 
        method, 
        date, 
        "isPartial"
      ) VALUES (
        gen_random_uuid(), 
        ${tabId}, 
        ${data.splitTotal}, 
        ${data.paymentMethod}, 
        ${now}, 
        true
      ) RETURNING id
    `;

    // Actualizar las cantidades de los productos en la tabla
    for (const paidItem of data.paidItems) {
      const tabItem = tab.items.find((item) => item.id === paidItem.id);

      if (tabItem) {
        const newQuantity = tabItem.quantity - paidItem.quantity;

        await (newQuantity > 0
          ? prisma.tabItem.update({
              where: { id: tabItem.id },
              data: { quantity: newQuantity },
            })
          : prisma.tabItem.delete({
              where: { id: tabItem.id },
            }));
      }
    }

    // Crear registro en transacciones usando consulta directa
    await prisma.$executeRaw`
      INSERT INTO "transactions" (
        id, 
        type, 
        amount, 
        "paymentMethod", 
        description, 
        "createdAt"
      ) VALUES (
        gen_random_uuid(), 
        'PAYMENT', 
        ${data.splitTotal}, 
        ${data.paymentMethod}, 
        ${`Pago parcial - Mesa ${tab.name}`}, 
        ${now}
      )
    `;

    // Verificar si quedan productos en la mesa
    const remainingItems = await prisma.tabItem.count({
      where: { tabId },
    });

    // Si no quedan productos, cerrar la mesa
    if (remainingItems === 0) {
      await prisma.$executeRaw`
        UPDATE "tabs" 
        SET "isActive" = false, 
            "updatedAt" = ${now}
        WHERE id = ${tabId}
      `;
    }

    return NextResponse.json({
      success: true,
      paymentId,
      remainingItems,
    });
  } catch (error) {
    console.error('Error processing split payment:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
