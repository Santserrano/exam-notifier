# Backend Express.js para Notificaciones de Exámenes

Este es el backend Express.js que maneja la comunicación con Supabase y proporciona endpoints para la aplicación Remix.

## Configuración

1. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
PORT=3001
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

2. Instala las dependencias:
```bash
pnpm install
```

## Desarrollo

Para iniciar el servidor en modo desarrollo:
```bash
pnpm dev
```

## Construcción

Para construir el proyecto:
```bash
pnpm build
```

## Producción

Para iniciar el servidor en modo producción:
```bash
pnpm start
```

## Endpoints

- `GET /api/health`: Verifica el estado del servidor
- `GET /api/notifications`: Obtiene todas las notificaciones 