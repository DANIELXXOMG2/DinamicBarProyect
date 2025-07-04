import { ProductType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { InventoryService } from '@/lib/services/inventory';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
  purchasePrice: z
    .number()
    .positive('El precio de compra debe ser positivo')
    .nullable(),
  salePrice: z
    .number()
    .positive('El precio de venta debe ser positivo')
    .nullable(),
  type: z.nativeEnum(ProductType),
  image: z.string().optional(),
  minStock: z
    .number()
    .int()
    .min(0, 'El stock mínimo debe ser mayor o igual a 0')
    .optional(),
});

// GET /api/inventory/products - Obtener todos los productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const searchTerm = searchParams.get('q') || undefined;

    const products = await (categoryId
      ? InventoryService.getProductsByCategory(categoryId)
      : InventoryService.getProductsWithSearch(searchTerm));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error in GET /api/inventory/products:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
}

// POST /api/inventory/products - Crear un nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await InventoryService.createProduct(validatedData);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/inventory/products:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
}
