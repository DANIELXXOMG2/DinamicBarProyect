import { NextRequest, NextResponse } from 'next/server'
import { SalesService } from '@/lib/services/sales'
import { PaymentMethod } from '@prisma/client'
import { z } from 'zod'

const createSaleSchema = z.object({
  tabId: z.string().min(1, 'El ID de la mesa es requerido'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  cashReceived: z.number().optional()
})

const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
})

// GET /api/sales - Obtener ventas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const today = searchParams.get('today')

    let sales
    
    if (today === 'true') {
      sales = await SalesService.getTodaySales()
    } else if (startDate && endDate) {
      // Validar las fechas con el esquema
      const validatedDates = dateRangeSchema.parse({
        startDate,
        endDate
      })
      
      sales = await SalesService.getSalesByDateRange(
        new Date(validatedDates.startDate),
        new Date(validatedDates.endDate)
      )
    } else {
      sales = await SalesService.getSales(limit)
    }

    return NextResponse.json({ sales })
  } catch (error) {
    console.error('Error in GET /api/sales:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Rango de fechas inválido', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al obtener las ventas' },
      { status: 500 }
    )
  }
}

// POST /api/sales - Procesar nueva venta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSaleSchema.parse(body)
    
    const sale = await SalesService.processSale(validatedData)
    return NextResponse.json({ sale }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/sales:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al procesar la venta' },
      { status: 500 }
    )
  }
}