import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { PurchasesService } from '@/lib/services/purchases';

const createPurchaseSchema = z.object({
  supplierId: z.string(),
  date: z.coerce.date(),
  items: z.array(
    z.object({
      productId: z.string(),

      quantity: z.number(),
      purchasePrice: z.number(),
      salePrice: z.number(),
      iva: z.number().optional(),
      total: z.number(),
    })
  ),
  subtotal: z.number(),
  totalIva: z.number(),
  grandTotal: z.number(),
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']),
  companyImage: z.string().optional(),
});

export async function GET() {
  try {
    const purchases = await PurchasesService.getPurchases();
    return NextResponse.json({ purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Error al obtener compras' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPurchaseSchema.parse(body);

    const newPurchase = await PurchasesService.createPurchase(validatedData);

    return NextResponse.json({ purchase: newPurchase }, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear compra' },
      { status: 500 }
    );
  }
}
