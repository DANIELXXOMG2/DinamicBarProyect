import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { SuppliersService } from '@/lib/services/suppliers';

const supplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  image: z.string().optional(),
});

// GET /api/suppliers - Obtener todos los proveedores
export async function GET() {
  try {
    const suppliers = await SuppliersService.getSuppliers();
    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error('Error in GET /api/suppliers:', error);
    return NextResponse.json(
      { error: 'Error al obtener los proveedores' },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - Crear un nuevo proveedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = supplierSchema.parse(body);

    const supplier = await SuppliersService.createSupplier(validatedData);
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/suppliers:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el proveedor' },
      { status: 500 }
    );
  }
}
