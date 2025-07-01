import { NextResponse } from 'next/server';
import * as ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DinamicBar';
    workbook.created = new Date();

    // Exportar Productos
    const productsSheet = workbook.addWorksheet('Productos');
    const products = await prisma.product.findMany({
      include: { category: true },
    });

    productsSheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Producto', key: 'name', width: 30 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Costo', key: 'cost', width: 15 },
      { header: 'Precio Venta', key: 'salePrice', width: 15 },
      { header: 'Stock', key: 'stock', width: 10 },
    ];

    for (const product of products) {
      productsSheet.addRow({
        ...product,
        category: product.category.name,
      });
    }

    // Exportar Proveedores
    const suppliersSheet = workbook.addWorksheet('Proveedores');
    const suppliers = await prisma.supplier.findMany();

    suppliersSheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Teléfono', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Dirección', key: 'address', width: 40 },
    ];

    suppliersSheet.addRows(suppliers);

    // Escribir en el buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="exportacion-dinamicbar.xlsx"',
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
