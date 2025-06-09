import { NextRequest, NextResponse } from 'next/server'
import { TabsService } from '@/lib/services/tabs'
import { z } from 'zod'

const addItemSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
  quantity: z.number().int().positive('La cantidad debe ser positiva'),
  price: z.number().positive('El precio debe ser positivo')
})

const updateItemSchema = z.object({
  quantity: z.number().int().min(0, 'La cantidad no puede ser negativa')
})

// POST /api/tabs/[id]/items - Agregar item a la mesa
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = addItemSchema.parse(body)
    
    const tab = await TabsService.addItemToTab({
      tabId: params.id,
      ...validatedData
    })
    
    return NextResponse.json({ tab }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tabs/[id]/items:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al agregar item a la mesa' },
      { status: 500 }
    )
  }
}