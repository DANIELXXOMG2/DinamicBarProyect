import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { SalesService } from '@/lib/services/sales';

const reportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// GET /api/sales/reports - Generar reporte de ventas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Las fechas de inicio y fin son requeridas' },
        { status: 400 }
      );
    }

    const validatedData = reportSchema.parse({ startDate, endDate });

    const report = await SalesService.generateSalesReport(
      new Date(validatedData.startDate),
      new Date(validatedData.endDate)
    );

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error in GET /api/sales/reports:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al generar el reporte de ventas' },
      { status: 500 }
    );
  }
}
