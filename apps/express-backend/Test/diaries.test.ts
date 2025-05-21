jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue({})
}))

import request from 'supertest'
import express from 'express'
import diariesRouter from '../src/routes/diaries'
import * as diariesServi from '../src/service/diariesServi'
import * as notifications from '../src/service/notifications'
import { toNewDaiaryEntry, toNewNotification } from '../src/Adapters/Adapter'

// Mock de los módulos
jest.mock('../src/service/diariesServi')
jest.mock('../src/service/notifications')
jest.mock('../src/Adapters/Adapter', () => ({
  toNewDaiaryEntry: jest.fn(),
  toNewNotification: jest.fn()
}))

// Mock de process.env
const mockEnv = {
  INTERNAL_API_KEY: 'test-api-key'
};
Object.assign(process.env, mockEnv);

const app = express()
app.use(express.json())
app.use('/api/diaries', diariesRouter)

describe('Diaries Router', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /', () => {
    it('Debería devolver todas las entradas del diario sin información confidencial.', async () => {
      const mockEntries = [
        {
          profesor: 'Gilda Romero',
          vocal: 'Jose Fernandez',
          carrera: 'Ingeniería en Sistemas',
          materia: 'Programacion Estructurada',
          fecha: '2025-05-15T10:00:00.000Z',
          descripcion: 'Examen Final',
          cargo: 'Examinador',
          verification: true,
          createdAt: '2025-05-10T08:00:00.000Z'
        }
      ]
        ; (diariesServi.getEntrisWithoutSensitiveInfo as jest.Mock).mockReturnValue(mockEntries)

      const response = await request(app)
        .get('/api/diaries')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockEntries)
      expect(diariesServi.getEntrisWithoutSensitiveInfo).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET /:id', () => {
    it('Debería devolver una entrada de diario cuando existe', async () => {
      const mockEntry = {
        id: 1,
        profesor: 'Gilda Romero',
        vocal: 'Jose Fernandez',
        carrera: 'Ingeniería en Sistemas',
        materia: 'Programacion Estructurada',
        fecha: '2025-05-15T10:00:00.000Z',
        descripcion: 'Examen Final',
        cargo: 'Examinador',
        verification: true,
        createdAt: '2025-05-10T08:00:00.000Z'
      }
        ; (diariesServi.findById as jest.Mock).mockReturnValue(mockEntry)

      const response = await request(app)
        .get('/api/diaries/1')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockEntry)
      expect(diariesServi.findById).toHaveBeenCalledWith(1)
    })

    it('Debería devolver 404 cuando la entrada de diario no existe', async () => {
      ; (diariesServi.findById as jest.Mock).mockReturnValue(undefined)

      const response = await request(app)
        .get('/api/diaries/999')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({ error: 'Diary not found' })
      expect(diariesServi.findById).toHaveBeenCalledWith(999)
    })
  })

  describe('POST /', () => {
    it('Debería agregar una nueva entrada de diario con datos válidos', async () => {
      const newEntryData = {
        profesor: 'Gilda Romero',
        vocal: 'Jose Fernandez',
        carrera: 'Ingeniería en Sistemas',
        materia: 'Programacion Estructurada',
        fecha: '2025-05-15T10:00:00.000Z',
        descripcion: 'Examen Final',
        cargo: 'Examinador',
        verification: true,
        createdAt: '2025-05-10T08:00:00.000Z'
      }

      const mockAddedEntry = {
        id: 4,
        ...newEntryData
      }

        ; (toNewDaiaryEntry as jest.Mock).mockReturnValue(newEntryData)
        ; (diariesServi.addDiary as jest.Mock).mockReturnValue(mockAddedEntry)

      const response = await request(app)
        .post('/api/diaries')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)
        .send(newEntryData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockAddedEntry)
      expect(toNewDaiaryEntry).toHaveBeenCalledWith(newEntryData)
      expect(diariesServi.addDiary).toHaveBeenCalledWith(newEntryData)
    })

    it('Debería devolver 400 por datos malformados', async () => {
      ; (toNewDaiaryEntry as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid data')
      })

      const response = await request(app)
        .post('/api/diaries')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)
        .send({ invalid: 'data' })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'malformed data' })
    })
  })

  describe('PUT /:id', () => {
    it('Debería actualizar una entrada de diario existente', async () => {
      const updatedData = {
        profesor: 'Gilda Romero',
        vocal: 'Jose Fernandez',
        carrera: 'Ingeniería en Sistemas',
        materia: 'Programacion Estructurada',
        fecha: '2025-05-15T10:00:00.000Z',
        descripcion: 'Examen Final Modificado',
        cargo: 'Examinador',
        verification: true,
        createdAt: '2025-05-10T08:00:00.000Z'
      }

      const mockUpdatedEntry = {
        id: 1,
        ...updatedData
      }

        ; (toNewDaiaryEntry as jest.Mock).mockReturnValue(updatedData)
        ; (diariesServi.updateDiaryEntry as jest.Mock).mockReturnValue(mockUpdatedEntry)

      const response = await request(app)
        .put('/api/diaries/1')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)
        .send(updatedData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockUpdatedEntry)
      expect(toNewDaiaryEntry).toHaveBeenCalledWith(updatedData)
      expect(diariesServi.updateDiaryEntry).toHaveBeenCalledWith(1, updatedData)
    })

    it('Debería devolver 404 cuando la entrada de diario no existe', async () => {
      const updatedData = {
        profesor: 'Gilda Romero',
        vocal: 'Jose Fernandez',
        carrera: 'Ingeniería en Sistemas',
        materia: 'Programacion Estructurada',
        fecha: '2025-05-15T10:00:00.000Z',
        descripcion: 'Examen Final',
        cargo: 'Examinador',
        verification: true,
        createdAt: '2025-05-10T08:00:00.000Z'
      }

        ; (toNewDaiaryEntry as jest.Mock).mockReturnValue(updatedData)
        ; (diariesServi.updateDiaryEntry as jest.Mock).mockReturnValue(null)

      const response = await request(app)
        .put('/api/diaries/999')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)
        .send(updatedData)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({ error: 'Diary entry not found' })
    })

    it('Debería devolver 400 por datos malformados', async () => {
      ; (toNewDaiaryEntry as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid data')
      })

      const response = await request(app)
        .put('/api/diaries/1')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)
        .send({ invalid: 'data' })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'Malformed data or validation error' })
    })
  })

  describe('POST /notifications', () => {
    it('Debería enviar una notificación con datos válidos', async () => {
      const subscription = { endpoint: 'test', keys: { auth: 'auth', p256dh: 'p256dh' } }
      const notificationData = {
        profesor: 'Gilda Romero',
        vocal: 'Jose Fernandez',
        mensage: 'Mensaje de prueba',
        fechaMesa: '2025-05-15T10:00:00.000Z',
        materia: 'Programacion Estructurada',
        carrera: 'Ingeniería en Sistemas',
        cargo: 'Examinador',
        leido: false,
        createAt: '2025-05-10T08:00:00.000Z'
      }

        ; (toNewNotification as jest.Mock).mockReturnValue(notificationData)
        ; (notifications.sendPushNotification as jest.Mock).mockImplementation(() => { })

      const response = await request(app)
        .post('/api/diaries/notifications')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)
        .send({
          subscription,
          notification: notificationData
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'Notification sent successfully' })
      expect(toNewNotification).toHaveBeenCalledWith(notificationData)
      expect(notifications.sendPushNotification).toHaveBeenCalledWith(subscription, notificationData)
    })

    it('Debería devolver 400 por datos de suscripción faltantes', async () => {
      const response = await request(app)
        .post('/api/diaries/notifications')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)
        .send({
          notification: {}
        })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'Missing subscription data' })
    })

    it('Debería devolver 500 cuando falla la notificación', async () => {
      const subscription = { endpoint: 'test', keys: { auth: 'auth', p256dh: 'p256dh' } }
      const notificationData = {
        profesor: 'Gilda Romero',
        vocal: 'Jose Fernandez',
        mensage: 'Mensaje de prueba',
        fechaMesa: '2025-05-15T10:00:00.000Z',
        materia: 'Programacion Estructurada',
        carrera: 'Ingeniería en Sistemas',
        cargo: 'Examinador',
        leido: false,
        createAt: '2025-05-10T08:00:00.000Z'
      }

        ; (toNewNotification as jest.Mock).mockReturnValue(notificationData)
        ; (notifications.sendPushNotification as jest.Mock).mockImplementation(() => {
          throw new Error('Error de prueba')
        })

      const response = await request(app)
        .post('/api/diaries/notifications')
        .set('x-api-key', mockEnv.INTERNAL_API_KEY)
        .send({
          subscription,
          notification: notificationData
        })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'Failed to send notification' })
    })
  })
})