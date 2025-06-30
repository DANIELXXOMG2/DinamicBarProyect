import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { SalesService } from '@/lib/services/sales';

const cancelSaleSchema = z.object({
  reason: z.string().min(1, 'La razón de cancelación es requerida'),
});

// GET /api/sales/[id] - Obtener venta específica
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sale = await SalesService.getSale(params.id);

    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sale });
  } catch (error) {
    console.error('Error in GET /api/sales/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener la venta' },
      { status: 500 }
    );
  }
}

// DELETE /api/sales/[id] - Cancelar venta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = cancelSaleSchema.parse(body);

    await SalesService.cancelSale(params.id, validatedData.reason);

    return NextResponse.json({ message: 'Venta cancelada exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/sales/[id]:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al cancelar la venta' },
      { status: 500 }
    );
  }
}
