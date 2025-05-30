import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { notificationFactory } from './core/notifications/NotificationFactory.js'
import { NotificationType } from './core/notifications/types.js'
import diaryRouter from './routes/diaries.js'
import notificationsRouter from './routes/notifications.js'
import { notificacionService } from './service/NotificationService.js'

// Cargar variables de entorno
dotenv.config()

const app = express()
const port = process.env.PORT || 3005

// Configuración de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://exam-notifier.vercel.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// Aplicar CORS antes de cualquier middleware
app.use(cors(corsOptions))
app.use(express.json())

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

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Configuración de notificaciones
app.get('/api/notifications/config/:profesorId', async (req, res) => {
  try {
    const config = await notificacionService.getConfigByProfesor(req.params.profesorId)
    res.json(config)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la configuración' })
  }
})

app.patch('/api/notifications/config/:profesorId', async (req, res) => {
  try {
    const config = await notificacionService.updateConfig(req.params.profesorId, req.body)
    res.json(config)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la configuración' })
  }
})

// Suscripciones push
app.post('/api/notifications/push/subscribe', async (req, res) => {
  try {
    const { profesorId, subscription } = req.body
    if (!profesorId || !subscription) {
      return res.status(400).json({ error: 'Faltan datos requeridos' })
    }

    const savedSubscription = await notificacionService.saveWebPushSubscription(profesorId, subscription)
    res.json(savedSubscription)
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la suscripción' })
  }
})

app.delete('/api/notifications/push/subscribe/:id', async (req, res) => {
  try {
    await notificacionService.deleteWebPushSubscription(req.params.id)
    res.json({ message: 'Suscripción eliminada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la suscripción' })
  }
})

// Envío de notificaciones
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { type, data } = req.body
    if (!type || !data) {
      return res.status(400).json({ error: 'Faltan datos requeridos' })
    }

    const notification = notificationFactory.createNotification(type as NotificationType, data)
    await notification.send()
    res.json({ message: 'Notificación enviada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar la notificación' })
  }
})

// Manejo de errores CORS
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.name === 'CORSError') {
    res.status(403).json({ error: 'CORS error' })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})