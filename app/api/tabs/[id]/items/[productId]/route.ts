import { NextRequest, NextResponse } from 'next/server'
import { TabsService } from '@/lib/services/tabs'
import { z } from 'zod'

const updateItemSchema = z.object({
  quantity: z.number().int().min(0, 'La cantidad no puede ser negativa')
})

// PUT /api/tabs/[id]/items/[productId] - Actualizar cantidad de item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const body = await request.json()
    const { quantity } = updateItemSchema.parse(body)
    
    const tab = await TabsService.updateTabItem(params.id, params.productId, { quantity })
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
      { error: 'Error al actualizar item de la mesa' },
      { status: 500 }
    )
  }
}

// DELETE /api/tabs/[id]/items/[productId] - Eliminar item de la mesa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const tab = await TabsService.removeItemFromTab(params.id, params.productId)
    return NextResponse.json({ tab, message: 'Item eliminado correctamente' })
  } catch (error) {
    console.error('Error in DELETE /api/tabs/[id]/items/[productId]:', error)
    return NextResponse.json(
      { error: 'Error al eliminar item de la mesa' },
      { status: 500 }
    )
  }
}