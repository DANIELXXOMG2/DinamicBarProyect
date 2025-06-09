import { NextRequest, NextResponse } from 'next/server'
import { TabsService } from '@/lib/services/tabs'
import { z } from 'zod'

const createTabSchema = z.object({
  name: z.string().min(1, 'El nombre de la mesa es requerido')
})

const addItemSchema = z.object({
  tabId: z.string().min(1, 'El ID de la mesa es requerido'),
  productId: z.string().min(1, 'El ID del producto es requerido'),
  quantity: z.number().int().positive('La cantidad debe ser positiva'),
  price: z.number().positive('El precio debe ser positivo')
})

// GET /api/tabs - Obtener todas las mesas activas
export async function GET() {
  try {
    const tabs = await TabsService.getActiveTabs()
    return NextResponse.json({ tabs })
  } catch (error) {
    console.error('Error in GET /api/tabs:', error)
    return NextResponse.json(
      { error: 'Error al obtener las mesas activas' },
      { status: 500 }
    )
  }
}

// POST /api/tabs - Crear una nueva mesa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTabSchema.parse(body)
    
    const tab = await TabsService.createTab(validatedData)
    return NextResponse.json({ tab }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tabs:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al crear la mesa' },
      { status: 500 }
    )
  }
}