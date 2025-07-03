import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { InventoryService } from '@/lib/services/inventory';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  purchasePrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  type: z.enum(['ALCOHOLIC', 'NON_ALCOHOLIC']).optional(),
  image: z.string().optional(),
  categoryId: z.string().optional(),
});

const stockUpdateSchema = z.object({
  action: z.enum(['set', 'increase', 'decrease']),
  quantity: z.number().int().min(0),
});

const imageUpdateSchema = z.object({
  action: z.enum(['updateImage', 'removeImage']),
  image: z.string().optional(),
});

// GET /api/inventory/products/[id] - Obtener un producto específico
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await InventoryService.getProduct(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error in GET /api/inventory/products/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/products/[id] - Actualizar un producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    const product = await InventoryService.updateProduct(id, validatedData);
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error in PUT /api/inventory/products/[id]:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/products/[id] - Eliminar un producto
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await InventoryService.deleteProduct(id);
    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error in DELETE /api/inventory/products/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
}

const generalUpdateBodySchema = z.object({
  name: z.string().min(1).optional(),
  purchasePrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  category: z.string().optional(),
});

interface UpdateData {
  name?: string;
  purchasePrice?: number;
  salePrice?: number;
  categoryId?: string;
  image?: string | null;
}

async function handleGeneralUpdate(id: string, body: unknown) {
  const parsedBody = generalUpdateBodySchema.parse(body);
  const { name, category, purchasePrice, salePrice } = parsedBody;
  let updateData: UpdateData = {};
  if (name) updateData.name = name;
  if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice;
  if (salePrice !== undefined) updateData.salePrice = salePrice;
  if (category) {
    const categoryRecord =
      await InventoryService.findOrCreateCategory(category);
    updateData.categoryId = categoryRecord.id;
  }
  return InventoryService.updateProduct(id, updateData);
}

async function handleImageUpdate(id: string, body: unknown) {
  const { action, image } = imageUpdateSchema.parse(body);
  return InventoryService.updateProduct(id, {
    image: action === 'updateImage' ? image : null,
  });
}

async function handleStockUpdate(id: string, body: unknown) {
  const { action, quantity } = stockUpdateSchema.parse(body);
  switch (action) {
    case 'set': {
      return InventoryService.updateStock(id, quantity);
    }
    case 'increase': {
      return InventoryService.increaseStock(id, quantity);
    }
    case 'decrease': {
      return InventoryService.decreaseStock(id, quantity);
    }
    default: {
      throw new Error('Acción de stock no válida');
    }
  }
}

// PATCH /api/inventory/products/[id] - Actualizar stock, imagen o campos del producto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, name, category, purchasePrice, salePrice } = body;

    let product;

    if (
      name ||
      category ||
      purchasePrice !== undefined ||
      salePrice !== undefined
    ) {
      product = await handleGeneralUpdate(id, body);
    } else if (action === 'updateImage' || action === 'removeImage') {
      product = await handleImageUpdate(id, body);
    } else if (action) {
      product = await handleStockUpdate(id, body);
    } else {
      return NextResponse.json(
        { error: 'Acción no especificada' },
        { status: 400 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error in PATCH /api/inventory/products/[id]:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}
