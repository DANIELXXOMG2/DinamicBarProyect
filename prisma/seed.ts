import { PrismaClient, ProductType } from '@prisma/client'
import { AuthService } from '@/lib/services/auth'

const prisma = new PrismaClient()

// Definimos localmente los tipos que necesitamos
type UserRole = 'ADMIN' | 'CASHIER' | 'WAITER'

interface CreateUserParams {
  username: string
  password: string
  role: UserRole
}

async function createUser(data: CreateUserParams) {
  // Hashear la contraseña directamente
  const hashedPassword = AuthService.hashPassword(data.password)
  
  // Usar prisma directamente para crear usuarios, evitando el uso de .user
  return prisma.$queryRaw`
    INSERT INTO users (id, username, password, role, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${data.username}, ${hashedPassword}, ${data.role}, NOW(), NOW())
    RETURNING id, username, role
  `
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  try {
    // Limpiar datos existentes
    await prisma.tabItem.deleteMany()
    await prisma.tab.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    
    // Eliminar usuarios directamente con SQL raw
    await prisma.$executeRaw`DELETE FROM users`
    
    await prisma.store.deleteMany()

    // Crear usuarios predeterminados
    await Promise.all([
      createUser({
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN'
      }),
      createUser({
        username: 'cajero',
        password: 'cajero123',
        role: 'CASHIER'
      }),
      createUser({
        username: 'mesero',
        password: 'mesero123',
        role: 'WAITER'
      })
    ])
    console.log('✅ Usuarios creados')

    // Crear información del local
    const store = await prisma.store.create({
      data: {
        name: 'Mi Restaurante POS',
        phone: '+1 234 567 8900',
        address: 'Calle Principal 123, Ciudad'
      }
    })
    console.log('✅ Información del local creada:', store.name)

    // Crear categorías
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Cervezas',
          icon: 'Beer',
          shortcut: '1'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Licores',
          icon: 'Wine',
          shortcut: '2'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Snaks',
          icon: 'Sandwich',
          shortcut: '3'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Gaseosas',
          icon: 'Coffee',
          shortcut: '4'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Miscelánea',
          icon: 'Package',
          shortcut: '5'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Cigarrería',
          icon: 'Cigarette',
          shortcut: '6'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Cacharrería',
          icon: 'Wrench',
          shortcut: '7'
        }
      })
    ])
    console.log('✅ Categorías creadas:', categories.length)

    // Crear productos
    const products = await Promise.all([
      // Cervezas
      prisma.product.create({
        data: {
          name: 'Corona',
          price: 5.99,
          stock: 24,
          minStock: 5,
          type: ProductType.ALCOHOLIC,
          categoryId: categories[0].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Heineken',
          price: 5.49,
          stock: 18,
          minStock: 5,
          type: ProductType.ALCOHOLIC,
          categoryId: categories[0].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Stella Artois',
          price: 6.99,
          stock: 15,
          minStock: 5,
          type: ProductType.ALCOHOLIC,
          categoryId: categories[0].id
        }
      }),
      
      // Licores
      prisma.product.create({
        data: {
          name: 'Jack Daniels',
          price: 8.99,
          stock: 12,
          minStock: 3,
          type: ProductType.ALCOHOLIC,
          categoryId: categories[1].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Absolut Vodka',
          price: 7.99,
          stock: 15,
          minStock: 3,
          type: ProductType.ALCOHOLIC,
          categoryId: categories[1].id
        }
      }),
      
      // Snaks
      prisma.product.create({
        data: {
          name: 'Nachos',
          price: 4.99,
          stock: 20,
          minStock: 5,
          type: ProductType.NON_ALCOHOLIC,
          categoryId: categories[2].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Papas Fritas',
          price: 3.99,
          stock: 25,
          minStock: 5,
          type: ProductType.NON_ALCOHOLIC,
          categoryId: categories[2].id
        }
      }),
      
      // Gaseosas
      prisma.product.create({
        data: {
          name: 'Coca Cola',
          price: 2.49,
          stock: 30,
          minStock: 10,
          type: ProductType.NON_ALCOHOLIC,
          categoryId: categories[3].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Sprite',
          price: 2.49,
          stock: 25,
          minStock: 10,
          type: ProductType.NON_ALCOHOLIC,
          categoryId: categories[3].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Fanta',
          price: 2.49,
          stock: 20,
          minStock: 10,
          type: ProductType.NON_ALCOHOLIC,
          categoryId: categories[3].id
        }
      }),
      
      // Miscelánea
      prisma.product.create({
        data: {
          name: 'Chicles',
          price: 1.99,
          stock: 50,
          minStock: 15,
          type: ProductType.NON_ALCOHOLIC,
          categoryId: categories[4].id
        }
      }),
      
      // Cigarrería
      prisma.product.create({
        data: {
          name: 'Marlboro Rojo',
          price: 8.99,
          stock: 40,
          minStock: 10,
          type: ProductType.NON_ALCOHOLIC,
          categoryId: categories[5].id
        }
      }),
      
      // Cacharrería
      prisma.product.create({
        data: {
          name: 'Cargador USB',
          price: 12.99,
          stock: 15,
          minStock: 5,
          type: ProductType.NON_ALCOHOLIC,
          categoryId: categories[6].id
        }
      })
    ])
    console.log('✅ Productos creados:', products.length)

    // Crear algunas mesas de ejemplo
    const tabs = await Promise.all([
      prisma.tab.create({
        data: {
          name: 'Mesa 1',
          isActive: true
        }
      }),
      prisma.tab.create({
        data: {
          name: 'Mesa 2',
          isActive: true
        }
      })
    ])
    console.log('✅ Mesas creadas:', tabs.length)

    // Agregar algunos items a las mesas
    await prisma.tabItem.create({
      data: {
        tabId: tabs[0].id,
        productId: products[0].id, // Corona
        quantity: 2,
        price: products[0].price
      }
    })

    await prisma.tabItem.create({
      data: {
        tabId: tabs[0].id,
        productId: products[5].id, // Nachos
        quantity: 1,
        price: products[5].price
      }
    })

    // Recalcular totales de las mesas
    for (const tab of tabs) {
      const tabItems = await prisma.tabItem.findMany({
        where: { tabId: tab.id }
      })
      
      const subtotal = tabItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
      
      await prisma.tab.update({
        where: { id: tab.id },
        data: {
          subtotal,
          total: subtotal
        }
      })
    }

    console.log('🎉 Seed completado exitosamente!')
  } catch (error) {
    console.error('Error en el seed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })