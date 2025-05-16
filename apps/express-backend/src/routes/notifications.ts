import { notificacionService } from "../service/NotificationService";
import express from "express";

const router = express.Router();

// Middleware para validar API key
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "API key inválida" });
  }
  next();
};

// Aplicar middleware a todas las rutas
router.use(validateApiKey);

// PATCH /notificaciones/config/:profesorId
router.patch('/notificaciones/config/:profesorId', async (req, res) => {
  const { profesorId } = req.params;
  const config = req.body;

  try {
    const updated = await notificacionService.updateConfig(profesorId, config);
    res.json(updated);
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// POST /notificaciones/push-subscription
router.post('/notificaciones/push-subscription', async (req, res) => {
  try {
    const { profesorId, subscription } = req.body;

    if (!profesorId || !subscription) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (!subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Datos de suscripción inválidos' });
    }

    const { endpoint, keys } = subscription;

    if (!keys.auth || !keys.p256dh) {
      return res.status(400).json({ error: 'Claves de suscripción inválidas' });
    }

    const saved = await notificacionService.saveWebPushSubscription(profesorId, endpoint, keys);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error guardando suscripción:', error);
    res.status(500).json({
      error: 'Error al guardar suscripción',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /notificaciones/config
router.post('/notificaciones/config', async (req, res) => {
  try {
    const { profesorId, webPushEnabled } = req.body;

    if (!profesorId) {
      return res.status(400).json({ error: 'ID de profesor requerido' });
    }

    const config = await notificacionService.updateConfig(profesorId, { webPushEnabled });
    res.status(200).json(config);
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      error: 'Error al actualizar configuración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
