import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const table = await prisma.table.findUnique({
      where: { id },
    });
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    return NextResponse.json(table);
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, tableGroupId, positionX, positionY } = body;

    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        name,
        positionX,
        positionY,
        ...(tableGroupId && { tableGroup: { connect: { id: tableGroupId } } }),
      },
    });

    return NextResponse.json(updatedTable);
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.table.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
