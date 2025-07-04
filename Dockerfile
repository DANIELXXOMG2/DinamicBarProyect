# Dockerfile para una aplicación Next.js

# Etapa de dependencias
FROM node:18-alpine AS deps
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install

# Etapa de construcción
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para la construcción
# Asegúrate de que el DATABASE_URL esté disponible durante la construcción si es necesario para Prisma
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Generar cliente de Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner
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
CMD ["npm", "start"]