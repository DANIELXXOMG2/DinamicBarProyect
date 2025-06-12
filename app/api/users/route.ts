import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { z } from 'zod'

// Definición local de UserRole para validación
const UserRole = z.enum(['ADMIN', 'CASHIER', 'WAITER'])
type UserRole = z.infer<typeof UserRole>

const createUserSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: UserRole
})

// Función auxiliar para verificar si el usuario es administrador
const verifyAdminRole = async (request: NextRequest): Promise<boolean> => {
  const userHeader = request.headers.get('x-user')
  let user = null

  if (userHeader) {
    try {
      user = JSON.parse(userHeader)
      return user?.role === 'ADMIN'
    } catch (error) {
      return false
    }
  }

  // Si no hay encabezado, intentar con localStorage (desde el middleware)
  return false
}

// GET /api/users - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    // Verificar si el usuario es administrador
    const isAdmin = await verifyAdminRole(request)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden ver la lista de usuarios' },
        { status: 403 }
      )
    }

    const users = await AuthService.getUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Error al obtener los usuarios' },
      { status: 500 }
    )
  }
}

// POST /api/users - Crear un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    // Verificar si el usuario es administrador
    const isAdmin = await verifyAdminRole(request)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden crear usuarios' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)
    
    const user = await AuthService.createUser({
      username: validatedData.username,
      password: validatedData.password,
      role: validatedData.role
    })
    
    // Eliminar la contraseña de la respuesta
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error && error.message === 'El nombre de usuario ya está en uso') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    )
  }
} 