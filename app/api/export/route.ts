import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Función para escapar comillas en CSV
const escapeCsvField = (field: string | number | null) => {
  if (field === null) {
    return '';
  }
  const str = String(field);
  // Si el campo contiene comillas, comas o saltos de línea, lo encerramos entre comillas dobles
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    // Las comillas dobles existentes se escapan con otra comilla doble
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
};

export async function GET() {
  try {
    // Exportar Productos
    const products = await prisma.product.findMany({
      include: { category: true },
    });

    const productHeaders = [
      'CATEGORIA',
      'PRODUCTO',
      'COSTO',
      'VALOR VENTA',
      'UNIDADES',
      'IMAGEN',
    ];
    const productRows = products.map((product) =>
      [
        product.category.name,
        product.name,
        product.purchasePrice,
        product.salePrice,
        product.stock,
        product.image || '',
      ]
        .map((field) => escapeCsvField(field))
        .join(';')
    );

    const csvContent = [productHeaders.join(';'), ...productRows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition':
          'attachment; filename="exportacion-dinamicbar.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
