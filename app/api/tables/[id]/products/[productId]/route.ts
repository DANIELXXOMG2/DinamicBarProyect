import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { id, productId } = await params;
    const url = new URL(req.url);
    const quantityToDelete = Number(url.searchParams.get('quantityToDelete'));
    const tabItemId = url.searchParams.get('tabItemId');
    const adminPassword = req.headers.get('X-Admin-Password');

    console.log('--- DEBUGGING DELETE PRODUCT ---');
    console.log('Table ID:', id);
    console.log('Product ID:', productId);
    console.log('Received Admin Password:', adminPassword);
    console.log(
      'Expected Admin Password from .env:',
      process.env.ADMIN_PASSWORD
    );

    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      console.log('Password comparison failed.');
      return new Response(
        JSON.stringify({ message: 'Contraseña incorrecta' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!tabItemId) {
      return new Response(
        JSON.stringify({ message: 'tabItemId is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const itemInTable = await prisma.tabItem.findUnique({
      where: {
        id: tabItemId,
      },
    });

    if (!itemInTable) {
      return new Response(
        JSON.stringify({ message: 'Product not found in table' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (quantityToDelete >= itemInTable.quantity) {
      await prisma.tabItem.delete({
        where: {
          id: itemInTable.id,
        },
      });
    } else {
      await prisma.tabItem.update({
        where: {
          id: itemInTable.id,
        },
        data: {
          quantity: itemInTable.quantity - quantityToDelete,
        },
      });
    }

    return new Response(
      JSON.stringify({ message: 'Product removed successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'An error occurred',
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
