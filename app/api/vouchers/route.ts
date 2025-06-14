import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const whereClause = type ? { type: type.toUpperCase() as 'INCOME' | 'EXPENSE' } : {}

    const vouchers = await prisma.voucher.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ vouchers })
  } catch (error) {
    console.error('Error fetching vouchers:', error)
    return NextResponse.json(
      { error: 'Error al obtener comprobantes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, amount, description, category, date } = body

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Tipo, monto y descripción son requeridos' },
        { status: 400 }
      )
    }

    const voucher = await prisma.voucher.create({
      data: {
        type: type.toUpperCase(),
        amount: parseFloat(amount),
        description,
        category,
        date: date ? new Date(date) : new Date()
      }
    })

    return NextResponse.json({ voucher }, { status: 201 })
  } catch (error) {
    console.error('Error creating voucher:', error)
    return NextResponse.json(
      { error: 'Error al crear comprobante' },
      { status: 500 }
    )
  }
}