# Exam Notifier - Aplicación Remix

Esta es la aplicación principal de Exam Notifier construida con Remix. Proporciona una interfaz web moderna y responsive para gestionar y notificar sobre exámenes.

## 🚀 Características

- Autenticación con Clerk
- Interfaz de usuario moderna con Tailwind CSS
- Pruebas unitarias con Jest
- Pruebas end-to-end con Playwright
- TypeScript para tipo seguro
- Integración con base de datos personalizada

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- pnpm (recomendado) o npm

## 🛠️ Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
pnpm install
```

## 🏃‍♂️ Desarrollo

Para iniciar el servidor de desarrollo:

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🧪 Testing

### Pruebas Unitarias
```bash
# Ejecutar todas las pruebas
pnpm test

# Ejecutar pruebas en modo watch
pnpm test:watch

# Ver cobertura de pruebas
pnpm test:coverage
```

### Pruebas E2E
```bash
# Ejecutar pruebas E2E
pnpm test:e2e

# Ejecutar pruebas E2E con UI
pnpm test:e2e:ui

# Ejecutar pruebas E2E en modo debug
pnpm test:e2e:debug
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

## 📦 Dependencias Principales

- Remix v2.8.1
- React v18.2.0
- Clerk para autenticación
- Tailwind CSS para estilos
- Jest y Playwright para testing

## 🔧 Scripts Disponibles

- `dev`: Inicia el servidor de desarrollo
- `build`: Construye la aplicación
- `start`: Inicia la aplicación en producción
- `test`: Ejecuta pruebas unitarias
- `test:e2e`: Ejecuta pruebas end-to-end
- `format`: Formatea el código
- `typecheck`: Verifica tipos TypeScript

## 📝 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 👥 Contribución

Por favor, asegúrate de seguir las guías de contribución del proyecto antes de enviar un pull request.
