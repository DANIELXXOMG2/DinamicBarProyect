import { PrismaClient, ProductType, UserRole } from '@prisma/client'
import { AuthService } from '@/lib/services/auth'
import { generateProducts } from './seedProducts'

const prisma = new PrismaClient()

// Definimos los tipos que necesitamos
interface CreateUserParams {
  username: string
  password: string
  role: UserRole
}

async function createUser(data: CreateUserParams) {
  // Hashear la contraseña
  const hashedPassword = AuthService.hashPassword(data.password)
  
  // Usar Prisma Client directamente en lugar de SQL raw
  return prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      role: data.role
    }
  })
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')
  console.time('Tiempo total de seed')

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...')
    console.time('Limpieza de datos')
    await prisma.tabItem.deleteMany()
    await prisma.tab.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    
    // Eliminar usuarios con Prisma Client
    await prisma.user.deleteMany()
    
    await prisma.store.deleteMany()
    console.timeEnd('Limpieza de datos')

    // Crear usuarios predeterminados
    console.log('👤 Creando usuarios...')
    console.time('Creación de usuarios')
    await Promise.all([
      createUser({
        username: 'admin',
        password: 'admin123',
        role: UserRole.ADMIN
      }),
      createUser({
        username: 'cajero',
        password: 'cajero123',
        role: UserRole.CASHIER
      }),
      createUser({
        username: 'mesero',
        password: 'mesero123',
        role: UserRole.WAITER
      }),
      createUser({
        username: process.env.ADMIN || 'danielxxomg',
        password: process.env.ADMIN_PASS || '40334277',
        role: UserRole.ADMIN
      })
    ])
    console.timeEnd('Creación de usuarios')
    console.log('✅ Usuarios creados')

    // Crear información del local
    console.log('🏢 Creando información del local...')
    console.time('Creación de información del local')
    const store = await prisma.store.create({
      data: {
        name: 'Mi Restaurante POS',
        phone: '+1 234 567 8900',
        address: 'Calle Principal 123, Ciudad'
      }
    })
    console.timeEnd('Creación de información del local')
    console.log('✅ Información del local creada:', store.name)

    // Crear categorías
    console.log('📂 Creando categorías...')
    console.time('Creación de categorías')
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
    console.timeEnd('Creación de categorías')
    console.log('✅ Categorías creadas:', categories.length)

    // Crear productos usando el generador
    console.log('🛒 Creando productos (alrededor de 200)...')
    console.time('Creación de productos')
    const products = await generateProducts(prisma, categories)
    console.timeEnd('Creación de productos')
    console.log('✅ Productos creados:', products.length)

    // Crear algunas mesas de ejemplo
    console.log('🪑 Creando mesas de ejemplo...')
    console.time('Creación de mesas')
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
        productId: products[0].id,
        quantity: 2
      }
    })

    await prisma.tabItem.create({
      data: {
        tabId: tabs[0].id,
        productId: products[5].id,
        quantity: 1
      }
    })
    console.timeEnd('Creación de mesas')

    // Recalcular totales de las mesas
    console.log('🧮 Recalculando totales...')
    console.time('Recálculo de totales')
    for (const tab of tabs) {
      const tabItems = await prisma.tabItem.findMany({
        where: { tabId: tab.id },
        include: { product: true }
      })
      
      const subtotal = tabItems.reduce((sum, item) => {
        return sum + (item.product.salePrice * item.quantity)
      }, 0)
      
      await prisma.tab.update({
        where: { id: tab.id },
        data: {
          subtotal,
          total: subtotal
        }
      })
    }
    console.timeEnd('Recálculo de totales')

    console.timeEnd('Tiempo total de seed')
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