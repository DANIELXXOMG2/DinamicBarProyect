import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tableId } = await params;
    const { productId, quantity } = await req.json();

    // Check if the item already exists
    const existingItem = await prisma.tabItem.findFirst({
      where: { tableId, productId },
    });

    if (existingItem) {
      // Update quantity if item exists
      const updatedItem = await prisma.tabItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return NextResponse.json(updatedItem);
    } else {
      // Create new item if it does not exist
      const newItem = await prisma.tabItem.create({
        data: {
          tableId,
          productId,
          quantity,
        },
      });
      return NextResponse.json(newItem);
    }
  } catch (error) {
    console.error('Error adding item to table:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
