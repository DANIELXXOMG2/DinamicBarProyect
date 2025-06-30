import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se encontró ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande (máximo 5MB)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único para el archivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    // Guardar archivo
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await writeFile(filePath, buffer);

    // Retornar URL del archivo
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
