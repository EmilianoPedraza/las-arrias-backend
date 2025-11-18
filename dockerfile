# syntax=docker/dockerfile:1

# Etapa 1: build
FROM node:22.18.0-alpine AS builder

# Crear usuario seguro para no usar root
RUN adduser -D -u 1001 userprod

# Establecer el directorio de trabajo de la API
WORKDIR /api_las_arrias

# Copiar los package.json con permisos del usuario seguro
COPY --chown=userprod:userprod package*.json ./

# Instalar dependencias (incluye dev para compilar TypeScript)
RUN npm ci

# Copiar todo el código fuente con permisos adecuados
COPY --chown=userprod:userprod . .

# Compilar TypeScript a JavaScript dentro de /dist
RUN npm run tsc


# Etapa 2: runtime (solo lo mínimo necesario)
FROM node:22.18.0-alpine AS runner

# Crear usuario seguro no-root
RUN adduser -D -u 1001 userprod

# Directorio donde correrá la app
WORKDIR /api_las_arrias

# Traer solo los archivos necesarios del builder
COPY --from=builder /api_las_arrias/dist ./dist
COPY --from=builder /api_las_arrias/package*.json ./

# Instalar certificados raíz para permitir la validación TLS con MongoDB Atlas
# (Alpine no los trae por defecto; sin este paso Atlas rechaza el handshake)
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Ajustar permisos para el usuario seguro
RUN chown -R userprod:userprod /api_las_arrias

# Ejecutar la app como usuario no-root
USER userprod

# Establecer entorno productivo
ENV NODE_ENV=production

# Exponer el puerto de la API (Railway lo mapea automáticamente)
EXPOSE 2213

# Comando de arranque
CMD ["node", "dist/index.js"]
