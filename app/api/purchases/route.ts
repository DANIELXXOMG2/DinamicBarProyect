import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ purchases })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Error al obtener compras' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      supplierId, 
      items, 
      subtotal, 
      totalIva, 
      grandTotal, 
      paymentMethod,
      companyImage,
      date 
    } = body

    if (!supplierId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Proveedor e items son requeridos' },
        { status: 400 }
      )
    }

    const purchase = await prisma.purchase.create({
      data: {
        supplierId,
        subtotal,
        totalIva,
        grandTotal,
        paymentMethod: paymentMethod || 'CASH',
        companyImage,
        date: date ? new Date(date) : new Date(),
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            salePrice: item.salePrice,
            iva: item.iva || 0,
            total: item.total
          }))
        }
      },
      include: {
        supplier: true,
        items: true
      }
    })

    // Actualizar stock de productos existentes
    for (const item of items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            },
            purchasePrice: item.purchasePrice,
            salePrice: item.salePrice
          }
        })
      }
    }

    return NextResponse.json({ purchase }, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json(
      { error: 'Error al crear compra' },
      { status: 500 }
    )
  }
}