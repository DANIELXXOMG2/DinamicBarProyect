import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { InventoryService } from '@/lib/services/inventory';

const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  icon: z.string().optional(),
  shortcut: z.string().optional(),
});

// GET /api/inventory/categories/[id] - Obtener una categoría específica
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categories = await InventoryService.getCategories();
    const category = categories.find((cat) => cat.id === id);

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error in GET /api/inventory/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener la categoría' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/categories/[id] - Actualizar una categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = categoryUpdateSchema.parse(body);

    const category = await InventoryService.updateCategory(id, validatedData);
    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error in PUT /api/inventory/categories/[id]:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/categories/[id] - Eliminar una categoría
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await InventoryService.deleteCategory(id);
    return NextResponse.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/inventory/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    );
  }
}
