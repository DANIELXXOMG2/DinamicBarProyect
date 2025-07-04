# Restaurant POS System

Sistema de punto de venta para restaurantes desarrollado con Next.js, TypeScript, Prisma y PostgreSQL.

# Restaurant POS System

## 🚀 Características

- **Gestión de Inventario**: Control completo de productos y categorías
- **Mesas Abiertas**: Manejo de órdenes por mesa en tiempo real
- **Base de Datos**: PostgreSQL con Prisma ORM
- **API REST**: Endpoints completos para todas las operaciones
- **Interfaz Moderna**: UI responsive con Tailwind CSS y shadcn/ui
- **Atajos de Teclado**: Navegación rápida con Alt+1-5

## 🚀 Guía de Despliegue con Docker

1. **Configurar Variables de Entorno**

   ```bash
   # Copia el archivo de ejemplo
   cp .env.example .env
   # Edita las variables según tu configuración
   ```

2. **Construir la Imagen**

   ```bash
   docker build -t restaurant-pos .
   ```

3. **Iniciar Servicios**

   ```bash
   docker-compose up -d
   ```

4. **Migrar Base de Datos**

   ```bash
   # Espera unos segundos a que PostgreSQL esté listo
   docker-compose exec app npx prisma migrate deploy
   docker-compose exec app npx prisma generate
   ```

5. **Acceder a la Aplicación**
   - App: http://localhost:3000
   - Adminer (DB): http://localhost:8080

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

## 🔄 Actualización y Mantenimiento

Cuando necesites actualizar la aplicación con los últimos cambios del código o ejecutar un comando específico (como migraciones de base de datos), sigue estos pasos:

1.  **Obtener Últimos Cambios**

    ```bash
    git pull origin master
    ```

2.  **Reconstruir la Imagen de la Aplicación**

    Este comando actualiza la imagen de Docker con tu nuevo código.

    ```bash
    docker-compose build app
    ```

3.  **Reiniciar los Servicios**

    Esto reiniciará el contenedor de la aplicación para que utilice la nueva imagen.

    ```bash
    docker-compose up -d
    ```

4.  **Ejecutar Comandos Específicos**

    Si necesitas ejecutar comandos como migraciones o generar el cliente de Prisma, usa `docker-compose exec`.

    ```bash
    # Ejemplo: Aplicar migraciones de la base de datos
    docker-compose exec app npx prisma migrate deploy

    # Ejemplo: Generar el cliente de Prisma
    docker-compose exec app npx prisma generate
    ```

## 🐳 Comandos Docker

```bash
# Gestión de contenedores
docker-compose up -d     # Iniciar servicios en segundo plano
docker-compose down      # Detener y eliminar contenedores
docker-compose ps        # Ver estado de contenedores
docker-compose logs      # Ver logs de todos los servicios

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

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
