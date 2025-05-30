# Exam Notifier - Backend Express

Este es el backend de la aplicación Exam Notifier, construido con Express.js. Proporciona una API RESTful para gestionar las notificaciones de exámenes y la comunicación con la base de datos.

## 🚀 Características

- API RESTful con Express.js
- Integración con Prisma ORM
- Soporte para Supabase
- Sistema de notificaciones con Web Push
- Integración con Redis para caché
- Envío de correos electrónicos con Resend
- TypeScript para desarrollo tipo seguro
- Pruebas unitarias con Jest

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- pnpm (recomendado) o npm
- Redis (para caché)
- Base de datos PostgreSQL (a través de Prisma)

## 🛠️ Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
pnpm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

## 🏃‍♂️ Desarrollo

Para iniciar el servidor de desarrollo:

```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:3005`

## 🧪 Testing

Para ejecutar las pruebas:

```bash
# Ejecutar todas las pruebas
pnpm test

```

## 🏗️ Construcción

Para construir la aplicación para producción:

```bash
pnpm build
```

## 🚀 Producción

Para iniciar la aplicación en producción:

```bash
pnpm start
```

## 🔧 Scripts Disponibles

- `dev`: Inicia el servidor de desarrollo con hot-reload
- `build`: Compila el código TypeScript
- `start`: Inicia la aplicación en producción
- `test`: Ejecuta pruebas unitarias

## 📁 Estructura del Proyecto

```
src/
├── controllers/    # Controladores de la API
├── routes/        # Definición de rutas
├── services/      # Lógica de negocio
├── middleware/    # Middleware de Express
├── utils/         # Utilidades y helpers
└── index.ts       # Punto de entrada
```

## 🔐 Variables de Entorno

Las siguientes variables de entorno son necesarias:

- `DATABASE_URL`: URL de conexión a la base de datos
- `REDIS_URL`: URL de conexión a Redis
- `SUPABASE_URL`: URL de Supabase
- `SUPABASE_KEY`: Clave de API de Supabase
- `RESEND_API_KEY`: Clave de API de Resend
- `VAPID_PUBLIC_KEY`: Clave pública para Web Push
- `VAPID_PRIVATE_KEY`: Clave privada para Web Push

## 👥 Contribución

Por favor, asegúrate de seguir las guías de contribución del proyecto antes de enviar un pull request.