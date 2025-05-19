import express from 'express'
import cors from 'cors'
import diaryRouter from './routes/diaries'
import notificationsRouter from './routes/notifications'
import { validateApiKey } from './middleware/apiKeyAuth'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
