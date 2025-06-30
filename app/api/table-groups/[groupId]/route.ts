import { NextResponse } from 'next/server';
import { updateTableGroup, deleteTableGroup } from '@/lib/services/tables';

interface Params {
  params: Promise<{ groupId: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { groupId } = await params;
    const { name } = await request.json();
    const updatedGroup = await updateTableGroup(groupId, name);
    return NextResponse.json(updatedGroup);
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { groupId } = await params;
    await deleteTableGroup(groupId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}
