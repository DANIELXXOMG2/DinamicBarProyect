import { NextRequest, NextResponse } from 'next/server'
import { InventoryService } from '@/lib/services/inventory'
import { ProductType } from '@prisma/client'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  purchasePrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  type: z.enum(['ALCOHOLIC', 'NON_ALCOHOLIC']).optional(),
  image: z.string().optional(),
  categoryId: z.string().optional()
})

const stockUpdateSchema = z.object({
  action: z.enum(['set', 'increase', 'decrease']),
  quantity: z.number().int().min(0)
})

const imageUpdateSchema = z.object({
  action: z.enum(['updateImage', 'removeImage']),
  image: z.string().optional()
})

// GET /api/inventory/products/[id] - Obtener un producto específico
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await InventoryService.getProduct(id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error in GET /api/inventory/products/[id]:', error)
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/products/[id] - Actualizar un producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)
    
    const product = await InventoryService.updateProduct(id, validatedData)
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error in PUT /api/inventory/products/[id]:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/products/[id] - Eliminar un producto
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await InventoryService.deleteProduct(id)
    return NextResponse.json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error('Error in DELETE /api/inventory/products/[id]:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}

// PATCH /api/inventory/products/[id] - Actualizar stock o imagen
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body
    
    let product
    
    // Manejar acciones de imagen
    if (action === 'updateImage' || action === 'removeImage') {
      const { image } = imageUpdateSchema.parse(body)
      
      if (action === 'updateImage') {
        product = await InventoryService.updateProduct(id, { image })
      } else if (action === 'removeImage') {
        product = await InventoryService.updateProduct(id, { image: null })
      }
    } else {
      // Manejar acciones de stock
      const { quantity } = stockUpdateSchema.parse(body)
      
      switch (action) {
        case 'set':
          product = await InventoryService.updateStock(id, quantity)
          break
        case 'increase':
          product = await InventoryService.increaseStock(id, quantity)
          break
        case 'decrease':
          product = await InventoryService.decreaseStock(id, quantity)
          break
        default:
          return NextResponse.json(
            { error: 'Acción no válida' },
            { status: 400 }
          )
      }
    }
    
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error in PATCH /api/inventory/products/[id]:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    )
  }
}