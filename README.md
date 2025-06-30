# Restaurant POS System

Sistema de punto de venta para restaurantes desarrollado con Next.js, TypeScript, Prisma y PostgreSQL.

## 🚀 Características

- **Gestión de Inventario**: Control completo de productos y categorías
- **Mesas Abiertas**: Manejo de órdenes por mesa en tiempo real
- **Base de Datos**: PostgreSQL con Prisma ORM
- **API REST**: Endpoints completos para todas las operaciones
- **Interfaz Moderna**: UI responsive con Tailwind CSS y shadcn/ui
- **Atajos de Teclado**: Navegación rápida con Alt+1-5

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

## 🛠️ Instalación

### Opción 1: Con Docker (Recomendado)

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd restaurant-pos
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Iniciar PostgreSQL con Docker**

   ```bash
   # Iniciar la base de datos
   docker-compose up -d

   # Verificar que esté funcionando
   docker-compose ps
   ```

4. **Configurar Prisma y migrar la base de datos**

   ```bash
   # Generar el cliente de Prisma
   npm run db:generate

   # Crear las tablas en la base de datos
   npm run db:push

   # Poblar con datos de ejemplo
   npm run db:seed
   ```

5. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en:
   - **App**: `http://localhost:3000`
   - **Adminer (DB Admin)**: `http://localhost:8080`

### Opción 2: PostgreSQL Local

1. **Instalar PostgreSQL localmente**
2. **Crear base de datos**
   ```sql
   CREATE DATABASE restaurant_pos;
   ```
3. **Actualizar `.env`** con tu configuración local
4. **Seguir pasos 4-5 de la opción Docker**

## 🗄️ Estructura de la Base de Datos

### Modelos Principales

- **Store**: Información del local (nombre, teléfono, imagen, dirección)
- **Category**: Categorías de productos (Cervezas, Licores, Snaks, etc.)
- **Product**: Inventario de productos con stock y precios
- **Tab**: Mesas abiertas con totales calculados
- **TabItem**: Items individuales de cada mesa

### Relaciones

- Una categoría puede tener múltiples productos
- Una mesa puede tener múltiples items
- Cada item está relacionado con un producto específico

## 🔌 API Endpoints

### Store (Información del Local)

- `GET /api/store` - Obtener información del local
- `POST /api/store` - Crear/actualizar información del local
- `PUT /api/store` - Actualizar información del local

### Inventory (Inventario)

- `GET /api/inventory/categories` - Obtener categorías
- `POST /api/inventory/categories` - Crear categoría
- `GET /api/inventory/products` - Obtener productos
- `POST /api/inventory/products` - Crear producto
- `GET /api/inventory/products/[id]` - Obtener producto específico
- `PUT /api/inventory/products/[id]` - Actualizar producto
- `DELETE /api/inventory/products/[id]` - Eliminar producto
- `PATCH /api/inventory/products/[id]` - Actualizar stock

### Tabs (Mesas Abiertas)

- `GET /api/tabs` - Obtener mesas activas
- `POST /api/tabs` - Crear nueva mesa
- `GET /api/tabs/[id]` - Obtener mesa específica
- `PUT /api/tabs/[id]` - Actualizar propina
- `DELETE /api/tabs/[id]` - Cerrar mesa
- `POST /api/tabs/[id]/items` - Agregar item a mesa
- `PUT /api/tabs/[id]/items/[productId]` - Actualizar cantidad de item
- `DELETE /api/tabs/[id]/items/[productId]` - Eliminar item de mesa

## ⌨️ Atajos de Teclado

- `Alt + 1` - Ir a Bebidas
- `Alt + 2` - Ir a Mesas Abiertas
- `Alt + 3` - Ir a Contabilidad
- `Alt + 4` - Ir a Inventario
- `Alt + 5` - Ir a Configuración

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar servidor de producción

# Base de datos
npm run db:generate      # Generar cliente de Prisma
npm run db:push          # Sincronizar esquema con BD
npm run db:seed          # Poblar con datos de ejemplo
npm run db:studio        # Abrir Prisma Studio
npm run db:reset         # Resetear base de datos
```

## 🐳 Comandos Docker

```bash
# Gestión de contenedores
docker-compose up -d     # Iniciar servicios en segundo plano
docker-compose down      # Detener y eliminar contenedores
docker-compose ps        # Ver estado de contenedores
docker-compose logs      # Ver logs de todos los servicios
docker-compose logs postgres  # Ver logs solo de PostgreSQL

# Gestión de datos
docker-compose down -v   # Eliminar contenedores y volúmenes
docker volume ls         # Listar volúmenes
docker volume rm restaurant-pos_postgres_data  # Eliminar datos de BD
```

## 🏗️ Arquitectura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── store/         # Endpoints del local
│   │   ├── inventory/     # Endpoints de inventario
│   │   └── tabs/          # Endpoints de mesas
│   ├── drinks/            # Página de bebidas
│   ├── open-tabs/         # Página de mesas abiertas
│   ├── inventory/         # Página de inventario
│   ├── accounting/        # Página de contabilidad
│   └── settings/          # Página de configuración
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── ...               # Componentes específicos
├── lib/                   # Utilidades y servicios
│   ├── services/         # Servicios de base de datos
│   │   ├── store.ts      # Servicio del local
│   │   ├── inventory.ts  # Servicio de inventario
│   │   └── tabs.ts       # Servicio de mesas
│   ├── prisma.ts         # Configuración de Prisma
│   └── utils.ts          # Utilidades generales
└── prisma/               # Configuración de base de datos
    ├── schema.prisma     # Esquema de la base de datos
    └── seed.ts           # Datos de ejemplo
```

## 🔧 Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Base de Datos**: PostgreSQL, Prisma ORM
- **Validación**: Zod
- **Iconos**: Lucide React
- **Formularios**: React Hook Form

## 📝 Notas de Desarrollo

### Servicios Implementados

1. **StoreService**: Manejo de información del local
2. **InventoryService**: Gestión completa de inventario
3. **TabsService**: Manejo de mesas y órdenes

### Características de la Base de Datos

- **Relaciones**: Configuradas con cascada para mantener integridad
- **Validaciones**: Esquemas Zod para validación de datos
- **Índices**: Optimizados para consultas frecuentes
- **Timestamps**: Seguimiento automático de creación y actualización

### Mejores Prácticas Implementadas

- **Separación de responsabilidades**: Servicios, controladores y modelos separados
- **Validación de datos**: Validación tanto en frontend como backend
- **Manejo de errores**: Respuestas consistentes y logging apropiado
- **Tipado fuerte**: TypeScript en todo el proyecto
- **API RESTful**: Endpoints siguiendo convenciones REST

## 🚀 Próximos Pasos

- [ ] Implementar autenticación y autorización
- [ ] Agregar reportes y analytics
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar soporte para múltiples locales
- [ ] Implementar backup automático
- [ ] Agregar tests unitarios e integración

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
