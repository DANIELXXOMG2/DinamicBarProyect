import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { AuthService } from '@/lib/services/auth';

const verifyPasswordSchema = z.object({
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyPasswordSchema.parse(body);

    const { success, message } = await AuthService.verifyAdminPassword(
      validatedData.password
    );

    if (!success) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/auth/verify-password:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al verificar la contraseña' },
      { status: 500 }
    );
  }
}
