import { PrismaClient, UserRole } from '@prisma/client';
import { AuthService } from '@/lib/services/auth';
import { generateProducts } from './seed-products';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Definimos los tipos que necesitamos
interface CreateUserParams {
  username: string;
  password: string;
  role: UserRole;
}

async function createUser(data: CreateUserParams) {
  // Hashear la contraseña
  const hashedPassword = AuthService.hashPassword(data.password);

  // Usar Prisma Client directamente en lugar de SQL raw
  return prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      role: data.role,
    },
  });
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');
  console.time('Tiempo total de seed');

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    console.time('Limpieza de datos');
    await prisma.tabItem.deleteMany();
    await prisma.table.deleteMany();
    await prisma.tableGroup.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    // Eliminar usuarios con Prisma Client
    await prisma.user.deleteMany();

    await prisma.store.deleteMany();
    console.timeEnd('Limpieza de datos');

    // Crear usuarios predeterminados
    console.log('👤 Creando usuarios...');
    console.time('Creación de usuarios');
    if (
      !process.env.ADMIN_USER ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.CASHIER_USER ||
      !process.env.CASHIER_PASSWORD ||
      !process.env.WAITER_USER ||
      !process.env.WAITER_PASSWORD
    ) {
      throw new Error('Missing user credentials in .env file');
    }

    await Promise.all([
      createUser({
        username: process.env.ADMIN_USER,
        password: process.env.ADMIN_PASSWORD,
        role: UserRole.ADMIN,
      }),
      createUser({
        username: process.env.CASHIER_USER,
        password: process.env.CASHIER_PASSWORD,
        role: UserRole.CASHIER,
      }),
      createUser({
        username: process.env.WAITER_USER,
        password: process.env.WAITER_PASSWORD,
        role: UserRole.WAITER,
      }),
    ]);
    console.timeEnd('Creación de usuarios');
    console.log('✅ Usuarios creados');

    // Crear información del local
    console.log('🏢 Creando información del local...');
    console.time('Creación de información del local');
    const store = await prisma.store.create({
      data: {
        name: 'Mi Restaurante POS',
        phone: '+1 234 567 8900',
        address: 'Calle Principal 123, Ciudad',
      },
    });
    console.timeEnd('Creación de información del local');
    console.log('✅ Información del local creada:', store.name);

    // Crear categorías
    console.log('📂 Creando categorías...');
    console.time('Creación de categorías');
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Cervezas',
          icon: 'Beer',
          shortcut: '1',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Licores',
          icon: 'Wine',
          shortcut: '2',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Snaks',
          icon: 'Sandwich',
          shortcut: '3',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Gaseosas',
          icon: 'Coffee',
          shortcut: '4',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Miscelánea',
          icon: 'Package',
          shortcut: '5',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Cigarrería',
          icon: 'Cigarette',
          shortcut: '6',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Cacharrería',
          icon: 'Wrench',
          shortcut: '7',
        },
      }),
    ]);
    console.timeEnd('Creación de categorías');
    console.log('✅ Categorías creadas:', categories.length);

    // Crear productos usando el generador
    console.log('🛒 Creando productos (alrededor de 200)...');
    console.time('Creación de productos');
    const products = await generateProducts(prisma, categories);
    console.timeEnd('Creación de productos');
    console.log('✅ Productos creados:', products.length);

    // Crear proveedor de prueba
    console.log('🏪 Creando proveedor de prueba...');
    console.time('Creación de proveedor');
    const testSupplier = await prisma.supplier.create({
      data: {
        name: 'Distribuidora Don Pepito el Chistoso',
        phone: '+1 555-PEPITO',
        email: 'donpepito@chistoso.com',
        address: 'Calle de la Risa 123, Pueblo Alegre',
        image:
          'https://videos.openai.com/vg-assets/assets%2Ftask_01jxp1aryafryaaq2m4ygb1nxn%2F1749865084_img_2.webp?st=2025-06-14T00%3A08%3A54Z&se=2025-06-20T01%3A08%3A54Z&sks=b&skt=2025-06-14T00%3A08%3A54Z&ske=2025-06-20T01%3A08%3A54Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=mSz0HNDLtgKFF4lMjsWPYgF01IWKvoWGfQOBwKIXTGI%3D&az=oaivgprodscus',
      },
    });
    console.timeEnd('Creación de proveedor');
    console.log('✅ Proveedor de prueba creado:', testSupplier.name);

    // Crear grupos de mesas y mesas
    console.log('🪑 Creando grupos de mesas y mesas...');
    console.time('Creación de mesas');
    const tableGroups = ['Frente', 'Centro', 'Atras'];
    for (const groupName of tableGroups) {
      const group = await prisma.tableGroup.create({
        data: {
          name: groupName,
        },
      });

      for (let i = 1; i <= 3; i++) {
        await prisma.table.create({
          data: {
            name: `Mesa ${i}`,
            tableGroupId: group.id,
          },
        });
      }
    }
    console.timeEnd('Creación de mesas');
    console.log('✅ Grupos de mesas y mesas creados');

    console.timeEnd('Tiempo total de seed');
    console.log('🎉 Seed completado exitosamente!');
  } catch (error) {
    console.error('Error en el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Error durante el seed:', error);
  process.exit(1);
});
