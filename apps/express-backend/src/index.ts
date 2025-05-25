import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import diaryRouter from './routes/diaries.js'

dotenv.config()

const app = express()
const port = 3005

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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
  console.log('Validando API key:', apiKey)

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    console.error('API key inválida')
    return res.status(401).json({ error: 'API key inválida' })
  }

  console.log('API key válida')
  next()
}

// Aplicar middleware de validación de API key a todas las rutas
app.use('/api', validateApiKey)

// Rutas
app.use('/api/diaries', diaryRouter)

// Ruta de prueba
app.get('/api/health', (req, res) => {
  console.log('Health check realizado')
  res.json({ status: 'ok' })
})

// Manejo de errores CORS
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  if (err.name === 'CORSError') {
    res.status(403).json({ error: 'CORS error' })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`)
})