import { NextRequest, NextResponse } from 'next/server'
import { CashRegisterService } from '@/lib/services/cash-register'
import { TransactionType } from '@prisma/client'
import { z } from 'zod'

const createTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  description: z.string().min(1, 'La descripción es requerida'),
  createdBy: z.string().optional()
})

// GET /api/cash-register/transactions - Obtener transacciones de la caja actual
export async function GET() {
  try {
    const cashRegister = await CashRegisterService.getCurrentCashRegister()
    if (!cashRegister) {
      return NextResponse.json(
        { error: 'No hay una caja registradora abierta' },
        { status: 404 }
      )
    }

    const transactions = await CashRegisterService.getCashRegisterTransactions(cashRegister.id)
    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error in GET /api/cash-register/transactions:', error)
    return NextResponse.json(
      { error: 'Error al obtener las transacciones' },
      { status: 500 }
    )
  }
}

// POST /api/cash-register/transactions - Agregar nueva transacción
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)
    
    const transaction = await CashRegisterService.addTransaction(validatedData)
    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/cash-register/transactions:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al agregar la transacción' },
      { status: 500 }
    )
  }
}