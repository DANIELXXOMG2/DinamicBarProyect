import { PaymentMethod } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { SalesService } from '@/lib/services/sales';

const createSaleSchema = z.object({
  tableId: z.string().min(1, 'El ID de la mesa es requerido'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  cashReceived: z.number().optional(),
});

const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// POST /api/sales - Procesar una venta
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = createSaleSchema.parse(body);
    const sale = await SalesService.processSale(validatedData);
    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error processing sale:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET /api/sales - Obtener ventas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const today = searchParams.get('today');

    let sales;

    if (today === 'true') {
      sales = await SalesService.getTodaySales();
    } else if (startDate && endDate) {
      // Validar las fechas con el esquema
      const validatedDates = dateRangeSchema.parse({
        startDate,
        endDate,
      });

      sales = await SalesService.getSalesByDateRange(
        new Date(validatedDates.startDate),
        new Date(validatedDates.endDate)
      );
    } else {
      sales = await SalesService.getSales(limit);
    }

    return NextResponse.json({ sales });
  } catch (error) {
    console.error('Error in GET /api/sales:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Rango de fechas inválido', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al obtener las ventas' },
      { status: 500 }
    );
  }
}
