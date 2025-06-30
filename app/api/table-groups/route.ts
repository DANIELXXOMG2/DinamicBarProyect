import { NextResponse } from 'next/server';
import { createTableGroup } from '@/lib/services/tables';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const newGroup = await createTableGroup(name);
    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}
