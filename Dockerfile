# Dockerfile para una aplicación Next.js con Bun

# Etapa de dependencias
FROM oven/bun:1 AS deps
WORKDIR /app

# Instalar dependencias
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Etapa de construcción
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para la construcción
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Generar cliente de Prisma
RUN bunx prisma generate

# Construir la aplicación
RUN bun run build

# Etapa de producción
FROM oven/bun:1 AS runner
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
# El puerto por defecto de Next.js es 3000
EXPOSE 3000

# Copiar artefactos de construcción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Iniciar la aplicación
CMD ["bun", "start"]