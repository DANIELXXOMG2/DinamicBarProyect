import { NextResponse } from 'next/server';
import { getTableGroupsWithTables, createTable } from '@/lib/services/tables';

export async function GET() {
  try {
    const tableGroups = await getTableGroupsWithTables();
    return NextResponse.json(tableGroups);
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, tableGroupId } = await request.json();
    const newTable = await createTable({ name, tableGroupId });
    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}
