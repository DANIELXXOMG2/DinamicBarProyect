import { NextRequest, NextResponse } from 'next/server'
import { StoreService } from '@/lib/services/store'
import { z } from 'zod'

const storeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().optional(),
  image: z.string().optional(),
  address: z.string().optional()
})

// GET /api/store - Obtener información del local
export async function GET() {
  try {
    const store = await StoreService.getStore()
    return NextResponse.json({ store })
  } catch (error) {
    console.error('Error in GET /api/store:', error)
    return NextResponse.json(
      { error: 'Error al obtener la información del local' },
      { status: 500 }
    )
  }
}

// POST /api/store - Crear o actualizar información del local
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = storeSchema.parse(body)
    
    const store = await StoreService.upsertStore(validatedData)
    return NextResponse.json({ store }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/store:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al guardar la información del local' },
      { status: 500 }
    )
  }
}

// PUT /api/store - Actualizar información del local
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = storeSchema.partial().parse(body)
    
    const store = await StoreService.updateStore(validatedData)
    return NextResponse.json({ store })
  } catch (error) {
    console.error('Error in PUT /api/store:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar la información del local' },
      { status: 500 }
    )
  }
}