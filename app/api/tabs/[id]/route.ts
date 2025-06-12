import { NextRequest, NextResponse } from 'next/server'
import { TabsService } from '@/lib/services/tabs'
import { z } from 'zod'

const updateTabSchema = z.object({
  name: z.string().min(1, 'El nombre de la mesa es requerido')
})

// GET /api/tabs/[id] - Obtener una mesa específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tab = await TabsService.getTab(id)
    
    if (!tab) {
      return NextResponse.json(
        { error: 'Mesa no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ tab })
  } catch (error) {
    console.error('Error in GET /api/tabs/[id]:', error)
    return NextResponse.json(
      { error: 'Error al obtener la mesa' },
      { status: 500 }
    )
  }
}



// PATCH /api/tabs/[id] - Actualizar mesa
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name } = updateTabSchema.parse(body)
    
    const tab = await TabsService.updateTab(id, { name })
    return NextResponse.json({ tab })
  } catch (error) {
    console.error('Error in PATCH /api/tabs/[id]:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar la mesa' },
      { status: 500 }
    )
  }
}

// DELETE /api/tabs/[id] - Cerrar mesa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tab = await TabsService.closeTab(id)
    return NextResponse.json({ tab, message: 'Mesa cerrada correctamente' })
  } catch (error) {
    console.error('Error in DELETE /api/tabs/[id]:', error)
    return NextResponse.json(
      { error: 'Error al cerrar la mesa' },
      { status: 500 }
    )
  }
}