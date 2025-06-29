import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'

import diaryRouter from './routes/diaries.js'
import notificationsRouter from './routes/notifications.js'

// Cargar variables de entorno
dotenv.config()

const app = express()
const port = process.env.PORT ?? 3005

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
app.use(morgan('dev'))

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas
app.use('/api/diaries', diaryRouter)
app.use('/api/diaries/notificaciones', notificationsRouter)

// Logging de rutas disponibles
console.log("Rutas disponibles:");
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach((h: any) => {
      if (h.route) {
        console.log(`${Object.keys(h.route.methods).join(', ').toUpperCase()} ${h.route.path}`);
      }
    });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
  })
}

export { app }