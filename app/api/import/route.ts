import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import csv from 'csv-parser';
import { prisma } from '@/lib/prisma';

interface CsvRecord {
  category: string;
  product: string;
  cost: string;
  salePrice: string;
  units: string;
}

async function parseCsv(buffer: Buffer): Promise<CsvRecord[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRecord[] = [];
    const stream = Readable.from(buffer);
    stream
      .pipe(
        csv({
          separator: ';',
          headers: ['category', 'product', 'cost', 'salePrice', 'units'],
          skipLines: 1, // Ignora la fila de encabezados del archivo
        })
      )
      .on('data', (data: CsvRecord) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const records = await parseCsv(buffer);

    for (const record of records) {
      const categoryName = record.category?.trim();
      const productName = record.product?.trim();
      const cost = Number.parseFloat(record.cost?.replace(',', '.') || '0');
      const salePrice = Number.parseFloat(
        record.salePrice?.replace(',', '.') || '0'
      );
      const stock = Number.parseInt(record.units || '0', 10);

      if (!categoryName || !productName) {
        console.warn('Skipping record due to missing data:', record);
        continue;
      }

      let category = await prisma.category.findUnique({
        where: { name: categoryName },
      });

      if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName },
        });
      }

      const existingProduct = await prisma.product.findFirst({
        where: { name: productName },
      });

      if (existingProduct) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            purchasePrice: cost,
            salePrice,
            stock,
            categoryId: category.id,
          },
        });
      } else {
        await prisma.product.create({
          data: {
            name: productName,
            purchasePrice: cost,
            salePrice,
            stock,
            categoryId: category.id,
          },
        });
      }
    }

    return NextResponse.json({ message: 'Import successful' });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}
