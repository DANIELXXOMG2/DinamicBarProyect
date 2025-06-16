import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voucherId = params.id

    // Verificar si el voucher existe
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId }
    })

    if (!voucher) {
      return NextResponse.json(
        { error: 'Comprobante no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el voucher
    await prisma.voucher.delete({
      where: { id: voucherId }
    })

    return NextResponse.json(
      { message: 'Comprobante eliminado correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting voucher:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el comprobante' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voucherId = params.id

    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId }
    })

    if (!voucher) {
      return NextResponse.json(
        { error: 'Comprobante no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ voucher })
  } catch (error) {
    console.error('Error fetching voucher:', error)
    return NextResponse.json(
      { error: 'Error al obtener el comprobante' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voucherId = params.id
    const body = await request.json()
    const { type, amount, description, category, date } = body

    // Verificar si el voucher existe
    const existingVoucher = await prisma.voucher.findUnique({
      where: { id: voucherId }
    })

    if (!existingVoucher) {
      return NextResponse.json(
        { error: 'Comprobante no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el voucher
    const voucher = await prisma.voucher.update({
      where: { id: voucherId },
      data: {
        ...(type && { type: type.toUpperCase() }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(category && { category }),
        ...(date && { date: new Date(date) })
      }
    })

    return NextResponse.json({ voucher })
  } catch (error) {
    console.error('Error updating voucher:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el comprobante' },
      { status: 500 }
    )
  }
}