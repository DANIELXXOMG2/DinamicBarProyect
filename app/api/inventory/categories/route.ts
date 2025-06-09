import { NextRequest, NextResponse } from 'next/server'
import { InventoryService } from '@/lib/services/inventory'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  icon: z.string().optional(),
  shortcut: z.string().optional()
})

// GET /api/inventory/categories - Obtener todas las categorías
export async function GET() {
  try {
    const categories = await InventoryService.getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error in GET /api/inventory/categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/categories - Crear una nueva categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = categorySchema.parse(body)
    
    const category = await InventoryService.createCategory(validatedData)
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/inventory/categories:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    )
  }
}