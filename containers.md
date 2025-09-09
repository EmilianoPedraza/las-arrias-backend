# Contenedores de desarrollo

## Entorno de Desarrollo con Contenedores

El entorno de desarrollo se configura a partir del archivo **`docker-compose-devcont.yml`**, el cual sirve como base para levantar el contenedor dentro de **Devcontainer**.
Sin embargo, también existe la alternativa de trabajar **fuera del entorno Devcontainer**, creando directamente el contenedor con el comando de `docker compose` apuntando al archivo **`docker-compose-dev.yml`** el cual es un contendor configurado para monitorear aquellos cambios que se
realicen en el host y aplicar dichos cambios de forma automatica en el contenedor, y , que tambien permanece escuchando peticiones.

### Dockerfile como base de contenedores de desarrollo

## Dockerfile como base de contenedores de desarrollo

Todos los contenedores de desarrollo utilizan configuraciones con Docker Compose que comparten el mismo cimiento base: **`Dockerfile.dev`**.  
Este archivo define la imagen que sirve como punto de partida para los entornos de desarrollo.

A continuación se muestra su contenido simplificado y explicado en detalle:

```dockerfile
# Usamos la sintaxis moderna de Dockerfile
# y definimos la imagen base
# syntax=docker/dockerfile:1
FROM node:22.18.0-alpine
# Creamos un usuario de desarrollo no-root
RUN adduser -D -u 1001 userdev
# Definimos el directorio de trabajo
WORKDIR /api_las_arrias_devcontainer
# Ajustamos permisos para el usuario sobre el directorio
RUN chown -R userdev:userdev /api_las_arrias_devcontainer
# Copiamos solo archivos de dependencias
COPY --chown=userdev:userdev package.json package-lock.json ./
# Establecemos el usuario no-root para el resto de operaciones
USER userdev
# Instalamos dependencias con npm ci (basado en package-lock.json)
RUN npm ci
# Copiamos el resto del código del proyecto
COPY --chown=userdev:userdev . .
```

### Persistencia de Datos

Tanto el contenedor definido en **`devcontainer.json`** (que usa `docker-compose-devcont.yml`) como el contenedor definido en **`docker-compose-dev.yml`** crean internamente una imagen de **MongoDB** que:

- Comparte el mismo volumen.
- Expone el mismo puerto.

De esta forma, las pruebas de **persistencia de datos** no se pierden al alternar entre el entorno Devcontainer y el contenedor creado con `docker-compose-dev.yml`.

---

## Nombres de contenedores según la forma de desarrollo

### Con entorno Devcontainer

- **Backend**

  - Servicio: `api_las_arrias_devcont_service`
  - Contenedor: `api_las_arrias_devcontainer`
  - Puerto: `8080:2213`

- **MongoDB**
  - Servicio: `las_arrias_mongo_service_dev`
  - Contenedor: `las_arrias_mongo_dev_container`
  - Puerto: `27017:27017`
  - Volumen: `lasarriasback_mongo-data-dev`

---

### Con Docker Compose directo

- **Backend**

  - Servicio: `api_las_arrias_service_dev`
  - Contenedor: `api_las_arrias_container_dev`
  - Puerto: `8080:2213`

- **MongoDB**
  - Servicio: `las_arrias_mongo_service_dev`
  - Contenedor: `las_arrias_mongo_dev_container`
  - Puerto: `27017:27017`
  - Volumen: `lasarriasback_mongo-data-dev`

---

## Consideraciones Importantes ⚠️

Al cambiar entre los diferentes entornos de desarrollo:

- **No elimine el volumen de MongoDB** (`lasarriasback_mongo-data-dev`), ya que es compartido entre los contenedores y garantiza la persistencia de datos.
- **Debe detener o eliminar el contenedor activo del backend** antes de iniciar el otro:
  - `api_las_arrias_devcontainer` (si está usando Devcontainer).
  - `api_las_arrias_container_dev` (si está usando Docker Compose directo).

Esto es necesario porque ambos mapean el mismo puerto y utilizan **bind mounts** con volúmenes anónimos, lo que generaría conflictos si ambos están en ejecución simultáneamente.
