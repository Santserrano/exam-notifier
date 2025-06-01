import { PrismaClient } from '@prisma/client';
import express from 'express';

import { notificationFactory } from '../core/notifications/NotificationFactory.js';
import { NotificationType } from '../core/notifications/types.js';
import { notificacionService } from '../service/NotificationService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para validar API key
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "API key inválida" });
  }
  return next();
};

// Aplicar middleware a todas las rutas
router.use(validateApiKey);

// GET /api/diaries/notificaciones/config/:profesorId
router.get('/config/:profesorId', async (req, res) => {
  const { profesorId } = req.params;
  try {
    const config = await notificacionService.getConfigByProfesor(profesorId);
    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    return res.status(200).json(config);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// PATCH /api/diaries/notificaciones/config/:profesorId
router.patch('/config/:profesorId', async (req, res) => {
  const { profesorId } = req.params;
  const updates = req.body;

  try {
    // Verificar que el profesor existe
    const profesor = await prisma.profesor.findUnique({
      where: { id: profesorId }
    });

    if (!profesor) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    // Obtener la configuración actual
    const currentConfig = await notificacionService.getConfigByProfesor(profesorId);
    if (!currentConfig) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    // Si se está desactivando webPush, eliminar la suscripción
    if (updates.webPushEnabled === false && currentConfig.webPushEnabled) {
      const subscriptions = await notificacionService.getWebPushSubscriptions(profesorId);
      for (const sub of subscriptions) {
        await notificacionService.deleteWebPushSubscription(sub.id);
      }
    }

    // Actualizar la configuración
    const updated = await notificacionService.updateConfig(profesorId, {
      ...currentConfig,
      ...updates
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al actualizar configuración'
    });
  }
});

// POST /api/diaries/notificaciones/push-subscription
router.post('/push-subscription', async (req, res) => {
  try {
    const { profesorId, subscription } = req.body;

    if (!profesorId || !subscription) {
      return res.status(400).json({
        error: 'Faltan datos requeridos'
      });
    }

    if (!subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        error: 'Datos de suscripción inválidos'
      });
    }

    // Verificar que el profesor existe
    const profesor = await prisma.profesor.findUnique({
      where: { id: profesorId }
    });

    if (!profesor) {
      return res.status(404).json({
        error: 'Profesor no encontrado'
      });
    }

    // Guardar la suscripción
    const saved = await notificacionService.saveWebPushSubscription(profesorId, subscription);

    // Actualizar la configuración del profesor
    const currentConfig = await notificacionService.getConfigByProfesor(profesorId);
    await notificacionService.updateConfig(profesorId, {
      ...currentConfig,
      webPushEnabled: true
    });

    return res.status(201).json({
      message: 'Suscripción guardada exitosamente',
      subscription: saved,
      config: {
        ...currentConfig,
        webPushEnabled: true
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al procesar la solicitud'
    });
  }
});

// GET /api/diaries/notificaciones/subscriptions/:profesorId
router.get('/subscriptions/:profesorId', async (req, res) => {
  try {
    const { profesorId } = req.params;
    const subscriptions = await notificacionService.getWebPushSubscriptions(profesorId);
    return res.status(200).json(subscriptions);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener las suscripciones' });
  }
});

// DELETE /api/diaries/notificaciones/subscription/:id
router.delete('/subscription/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubscription = await notificacionService.deleteWebPushSubscription(id);
    return res.status(200).json(deletedSubscription);
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar la suscripción' });
  }
});

// POST /api/diaries/notificaciones/send
router.post('/send', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const notification = notificationFactory.createNotification(type as NotificationType, data);
    await notification.send();
    res.json({ message: 'Notificación enviada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar la notificación' });
  }
});

export default router;
