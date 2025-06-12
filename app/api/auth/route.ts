import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

// POST /api/auth - Iniciar sesión
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    
    const { success, user, message } = await AuthService.login(
      validatedData.username, 
      validatedData.password
    )
    
    if (!success) {
      return NextResponse.json(
        { error: message },
        { status: 401 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in POST /api/auth:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
} 