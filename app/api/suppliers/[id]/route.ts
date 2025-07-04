import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { SuppliersService } from '@/lib/services/suppliers';

const supplierUpdateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  address: z.string().optional(),
  image: z.string().optional(),
});

// GET /api/suppliers/[id] - Obtener un proveedor específico
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplier = await SuppliersService.getSupplier(id);

    if (!supplier) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error('Error in GET /api/suppliers/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener el proveedor' },
      { status: 500 }
    );
  }
}

// PUT /api/suppliers/[id] - Actualizar un proveedor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = supplierUpdateSchema.parse(body);

    const supplier = await SuppliersService.updateSupplier(id, validatedData);
    return NextResponse.json({ supplier });
  } catch (error) {
    console.error('Error in PUT /api/suppliers/[id]:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar el proveedor' },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id] - Eliminar un proveedor
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await SuppliersService.deleteSupplier(id);
    return NextResponse.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/suppliers/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el proveedor' },
      { status: 500 }
    );
  }
}
