import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { CashRegisterService } from '@/lib/services/cash-register';

const openCashRegisterSchema = z.object({
  openingAmount: z
    .number()
    .min(0, 'El monto de apertura debe ser mayor o igual a 0'),
  openedBy: z.string().optional(),
  notes: z.string().optional(),
});

const closeCashRegisterSchema = z.object({
  closingAmount: z
    .number()
    .min(0, 'El monto de cierre debe ser mayor o igual a 0'),
  closedBy: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/cash-register - Obtener caja registradora actual
export async function GET() {
  try {
    const cashRegister = await CashRegisterService.getCurrentCashRegister();
    return NextResponse.json({ cashRegister });
  } catch (error) {
    console.error('Error in GET /api/cash-register:', error);
    return NextResponse.json(
      { error: 'Error al obtener la caja registradora' },
      { status: 500 }
    );
  }
}

// POST /api/cash-register - Abrir nueva caja registradora
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = openCashRegisterSchema.parse(body);

    const cashRegister =
      await CashRegisterService.openCashRegister(validatedData);
    return NextResponse.json({ cashRegister }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/cash-register:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al abrir la caja registradora' },
      { status: 500 }
    );
  }
}

// PUT /api/cash-register - Cerrar caja registradora actual
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = closeCashRegisterSchema.parse(body);

    const summary = await CashRegisterService.closeCashRegister(validatedData);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in PUT /api/cash-register:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al cerrar la caja registradora' },
      { status: 500 }
    );
  }
}
