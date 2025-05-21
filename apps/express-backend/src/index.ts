import express from 'express'
import cors from 'cors'
import diaryRouter from './routes/diaries'
import notificationsRouter from './routes/notifications'
import { validateApiKey } from './middleware/apiKeyAuth'
import dotenv from 'dotenv'
import { notificacionService } from './service/NotificationService'

dotenv.config()

const app = express()
const port = process.env.EXPRESS_PORT || 3001

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  credentials: true
}))

app.use(express.json())

app.get('/ping', (_req, res) => {
  console.log('someine pinged here!!')
  res.send('pong')
})

// Protección de rutas para /api
app.use('/api', validateApiKey)

app.use('/api/diaries', diaryRouter)
app.use('/api', notificationsRouter)

// Middleware para verificar API key
const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key']
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'API key inválida' })
  }
  next()
}

// Rutas de notificaciones
app.post('/api/notificaciones/push-subscription', checkApiKey, async (req, res) => {
  try {
    const { profesorId, subscription } = req.body;

    if (!profesorId || !subscription) {
      return res.status(400).json({
        error: 'Faltan datos requeridos',
        received: { profesorId, subscription: !!subscription }
      });
    }

    console.log('Guardando suscripción para profesor:', profesorId);

    // Primero verificamos si ya existe una configuración
    const existingConfig = await notificacionService.getConfigByProfesor(profesorId);
    console.log('Configuración existente:', existingConfig);

    // Guardar la suscripción push
    const pushSubscription = await notificacionService.saveWebPushSubscription(
      profesorId,
      subscription.endpoint,
      subscription.keys
    );

    console.log('Suscripción guardada:', pushSubscription);

    // Crear o actualizar la configuración de notificaciones
    const config = await notificacionService.updateConfig(profesorId, {
      webPushEnabled: true,
      emailEnabled: false,
      smsEnabled: false,
      reminderMinutes: 1440 // 24 horas en minutos
    });

    console.log('Configuración actualizada:', config);

    if (!config) {
      throw new Error('No se pudo crear/actualizar la configuración');
    }

    // Verificar que la configuración se haya guardado correctamente
    const verifyConfig = await notificacionService.getConfigByProfesor(profesorId);
    console.log('Verificación de configuración:', verifyConfig);

    if (!verifyConfig || !verifyConfig.webPushEnabled) {
      throw new Error('La configuración no se guardó correctamente');
    }

    res.json({
      success: true,
      pushSubscription,
      config: verifyConfig
    });
  } catch (error) {
    console.error('Error al guardar suscripción:', error);
    res.status(500).json({
      error: 'Error al guardar la suscripción',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

app.get('/api/notifications', (req, res) => {
  const subscription = req.body
  console.log('Subscription received:', subscription)
  res.status(201).json({ message: 'Subscription received' })
})
