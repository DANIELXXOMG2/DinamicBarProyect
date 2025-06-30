import { NextRequest, NextResponse } from 'next/server';

import { AuthService } from '@/lib/services/auth';

// Función auxiliar para verificar si el usuario es administrador
const verifyAdminRole = async (request: NextRequest): Promise<boolean> => {
  const userHeader = request.headers.get('x-user');
  let user = null;

  if (userHeader) {
    try {
      user = JSON.parse(userHeader);
      return user?.role === 'ADMIN';
    } catch {
      return false;
    }
  }

  // Si no hay encabezado, intentar con localStorage (desde el middleware)
  return false;
};

// Endpoint para obtener un usuario específico
export async function GET(_request: NextRequest) {
  try {
    // Verificar si el usuario es administrador
    const isAdmin = await verifyAdminRole(_request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden ver detalles de usuarios' },
        { status: 403 }
      );
    }

    // Este endpoint debe implementarse en AuthService
    // const user = await AuthService.getUserById(userId)

    // Por ahora, como no tenemos esa función, devolveremos un error
    return NextResponse.json(
      { error: 'Funcionalidad no implementada' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

// Endpoint para actualizar un usuario
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar si el usuario es administrador
    const isAdmin = await verifyAdminRole(_request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden actualizar usuarios' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const body = await _request.json();

    // Validación de datos
    if (body.role && !['ADMIN', 'CASHIER', 'WAITER'].includes(body.role)) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    const updatedUser = await AuthService.updateUser(userId, {
      password: body.password,
      role: body.role,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

// Endpoint para eliminar un usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar si el usuario es administrador
    const isAdmin = await verifyAdminRole(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden eliminar usuarios' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;

    // Verificar si es el último administrador
    // Esto debería implementarse en un método separado

    await AuthService.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
