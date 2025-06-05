import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { initRedis } from './lib/redis.js'
import diaryRouter from './routes/diaries.js'
import notificationsRouter from './routes/notifications.js'

// Cargar variables de entorno
dotenv.config()

const app = express()
const port = process.env.PORT ?? 3005

// Inicializar Redis (ahora con soporte para modo deshabilitado)
initRedis().catch(err => {
  console.error('Error al inicializar Redis:', err);
  // No terminamos el proceso si Redis está deshabilitado
  if (process.env.REDIS_ENABLED === 'true') {
    process.exit(1);
  }
});

// Configuración de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL ?? 'https://ucpmesas.site']
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// Aplicar CORS antes de cualquier middleware
app.use(cors(corsOptions))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Middleware para validar API key
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'API key inválida' })
  }

  next()
}

// Aplicar middleware de validación de API key a todas las rutas
app.use('/api', validateApiKey)

// Rutas
app.use('/api/diaries', diaryRouter)
app.use('/api/diaries/notificaciones', notificationsRouter)

// Manejo de errores CORS
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.name === 'CORSError') {
    res.status(403).json({ error: 'CORS error' })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
  })
}

export { app }