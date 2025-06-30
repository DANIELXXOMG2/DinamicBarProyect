import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { PurchasesService } from '@/lib/services/purchases';

const updatePurchaseSchema = z.object({
  supplierId: z.string().optional(),
  date: z.coerce.date().optional(),
  subtotal: z.number().optional(),
  totalIva: z.number().optional(),
  grandTotal: z.number().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']).optional(),
  companyImage: z.string().optional(),
});

// GET /api/purchases/[id] - Obtener una compra específica
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchase = await PurchasesService.getPurchase(params.id);

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ purchase });
  } catch (error) {
    console.error('Error in GET /api/purchases/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener la compra' },
      { status: 500 }
    );
  }
}

// PUT /api/purchases/[id] - Actualizar una compra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updatePurchaseSchema.parse(body);

    const updatedPurchase = await PurchasesService.updatePurchase(
      params.id,
      validatedData
    );

    return NextResponse.json({ purchase: updatedPurchase });
  } catch (error) {
    console.error('Error in PUT /api/purchases/[id]:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar la compra' },
      { status: 500 }
    );
  }
}

// DELETE /api/purchases/[id] - Eliminar una compra
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await PurchasesService.deletePurchase(params.id);

    return NextResponse.json({ message: 'Compra eliminada exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/purchases/[id]:', error);

    if (error instanceof Error && error.message === 'Compra no encontrada') {
      return NextResponse.json(
        { error: 'Compra no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar la compra' },
      { status: 500 }
    );
  }
}
