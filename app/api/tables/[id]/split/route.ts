import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tableId } = await params;
  const { itemsToPay } = await request.json();

  if (!tableId || !itemsToPay || !Array.isArray(itemsToPay)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of itemsToPay) {
        const tabItem = await tx.tabItem.findUnique({
          where: { id: item.tabItemId },
        });

        if (!tabItem) {
          throw new Error(
            `El producto con id ${item.tabItemId} no se encontró en la mesa.`
          );
        }

        if (item.quantity > tabItem.quantity) {
          throw new Error(
            `La cantidad a pagar del producto ${tabItem.productId} excede la cantidad en la mesa.`
          );
        }

        const newQuantity = tabItem.quantity - item.quantity;

        // Update product stock
        await tx.product.update({
          where: { id: tabItem.productId },
          data: { stock: { decrement: item.quantity } },
        });

        if (newQuantity > 0) {
          await tx.tabItem.update({
            where: { id: item.tabItemId },
            data: { quantity: newQuantity },
          });
        } else {
          await tx.tabItem.delete({
            where: { id: item.tabItemId },
          });
        }
      }
    });

    return NextResponse.json({
      message: 'Pago parcial procesado correctamente',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error al procesar el pago parcial: ${errorMessage}` },
      { status: 500 }
    );
  }
}
