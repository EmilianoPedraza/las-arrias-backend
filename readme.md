# Las Arrias API

**Las Arrias API** es el servicio **backend central** que da soporte a la plataforma **Las Arrias Web**, una aplicación diseñada para conectar a la comunidad, facilitar proyectos, negocios locales, noticias y actividades.

Esta API está construida bajo un enfoque **RESTful**, funcionando como núcleo lógico para la persistencia de datos y el procesamiento de los mismos realizando este trabajo de forma segura.  
Su arquitectura puede describirse como un **monolito modular centralizado**, expuesto al frontend a través de un **BFF/API Gateway** en Next.js.

---

## Tecnologías principales

- **Node.js + Express** → servidor backend.
- **MongoDB (Atlas)** → base de datos principal para almacenamiento persistente.
- **Mongoose** → modelado de datos con validaciones y esquemas.
- **Redis** → almacenamiento en memoria para optimizar validaciones en tiempo real y mensajería.
- **JWT (JSON Web Tokens)** → autenticación y autorización segura.
- **TypeScript** → tipado fuerte y mantenibilidad del código.
- **Docker + Devcontainer** → entornos de desarrollo aislados, con dependencias consistentes y configuraciones listas para iniciar el proyecto de forma inmediata.

---

## Funcionalidades principales

- **Gestión de usuarios**

  - Registro de nuevos usuarios con almacenamiento en Mongo Atlas.
  - Login de usuarios con generación y envío de tokens de acceso.
  - Validación y verificación de identidad mediante JWT.
  - Protección de rutas con autenticación obligatoria.
  - Verificación rápida de usuarios existentes usando Redis.

- **Optimización en tiempo real**
  - Uso de Redis para cachear validaciones críticas.
  - Manejo de datos temporales y mensajería entre usuarios registrados.

---

## Características clave

- **Backend centralizado**: concentra toda la lógica de negocio y persistencia de datos.
- **Escalabilidad progresiva**: preparado para evolucionar hacia servicios más distribuidos si fuese necesario.
- **Integración con BFF (Next.js)**: las solicitudes del frontend no se comunican directamente con la API, sino a través de un backend interno que actúa como **puerta de entrada y capa de seguridad**.
- **Enfoque modular**: aunque monolítico, está organizado en módulos que permiten aislar responsabilidades (usuarios, validaciones, mensajería, etc.).

---

## Próximos pasos

- Extender el manejo de mensajería con Redis a eventos en tiempo real (ej.: WebSockets).
- Definir módulos adicionales para proyectos comunitarios, negocios y noticias.
- Incorporar pruebas automatizadas y CI/CD para mejorar despliegues.

---
