# syntax=docker/dockerfile:1

# Etapa 1: build
FROM node:22.18.0-alpine AS builder

# Crear usuario seguro
RUN adduser -D -u 1001 userprod

# Establecer el directorio de trabajo
WORKDIR /api_las_arrias

# Copiar package.json y lock
COPY --chown=userprod:userprod package*.json ./

# Instalar dependencias de producción y desarrollo (necesarias para compilar)
RUN npm ci

# Copiar el resto del código fuente
COPY --chown=userprod:userprod . .

# Compilar TypeScript
RUN npm run tsc

# Etapa 2: runtime
FROM node:22.18.0-alpine AS runner

# Crear usuario no-root
RUN adduser -D -u 1001 userprod

# Directorio de trabajo
WORKDIR /api_las_arrias

# Copiar solo los archivos necesarios desde el builder
COPY --from=builder /api_las_arrias/dist ./dist
COPY --from=builder /api_las_arrias/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Asignar permisos al usuario seguro
RUN chown -R userprod:userprod /api_las_arrias

# Cambiar al usuario no-root
USER userprod

# Establecer variable de entorno
ENV NODE_ENV=production

# Exponer el puerto que usa su app (Railway lo mapea automáticamente)
EXPOSE 2213

# Comando de arranque
CMD ["node", "dist/index.js"]