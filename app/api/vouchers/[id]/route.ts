import { prisma as db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const voucher = await db.voucher.findUnique({
      where: {
        id,
      },
    });

    if (!voucher) {
      return NextResponse.json(
        { message: 'Voucher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(voucher, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong!' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const voucher = await db.voucher.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });

    return NextResponse.json(voucher, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong!' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.voucher.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Voucher deleted' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong!' },
      { status: 500 }
    );
  }
}
