import { NextRequest, NextResponse } from 'next/server'
import { TabsService } from '@/lib/services/tabs'
import { z } from 'zod'

const addItemSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
  quantity: z.number().int().positive('La cantidad debe ser positiva')
})

const updateItemSchema = z.object({
  quantity: z.number().int().min(0, 'La cantidad no puede ser negativa')
})

// POST /api/tabs/[id]/items - Agregar item a la mesa
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = addItemSchema.parse(body)
    
    const tab = await TabsService.addItemToTab({
      tabId: id,
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

// PUT /api/tabs/[id]/items/[productId] - Actualizar cantidad de un item en la mesa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, productId: string }> }
) {
  try {
    const { id, productId } = await params
    const body = await request.json()
    const validatedData = updateItemSchema.parse(body)
    
    const tab = await TabsService.updateTabItem(
      id,
      productId,
      { quantity: validatedData.quantity }
    )
    
    return NextResponse.json({ tab })
  } catch (error) {
    console.error('Error in PUT /api/tabs/[id]/items/[productId]:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el item en la mesa' },
      { status: 500 }
    )
  }
}