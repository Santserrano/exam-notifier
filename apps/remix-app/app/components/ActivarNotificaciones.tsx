import { useState } from 'react';
import { Button } from '@exam-notifier/ui/components/button';
import { useUser } from '@clerk/remix';
import { useLoaderData } from '@remix-run/react';

interface LoaderData {
  env: {
    VAPID_PUBLIC_KEY: string;
    INTERNAL_API_KEY: string;
    API_URL: string;
  };
}

export function ActivarNotificaciones() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { env } = useLoaderData<LoaderData>();

  const activarNotificaciones = async () => {
    if (!user) {
      setError('Debes iniciar sesión para activar las notificaciones');
      return;
    }

    if (!env.VAPID_PUBLIC_KEY) {
      setError('Error de configuración: VAPID_PUBLIC_KEY no está definida');
      return;
    }

    if (!env.INTERNAL_API_KEY) {
      setError('Error de configuración: INTERNAL_API_KEY no está definida');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Solicitar permisos
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permiso de notificación denegado');
      }

      // 2. Registrar service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);

      // 3. Obtener suscripción push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: env.VAPID_PUBLIC_KEY
      });

      console.log('Suscripción obtenida:', subscription);

      // 4. Enviar suscripción al backend
      const response = await fetch(`${env.API_URL}/api/notificaciones/push-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.INTERNAL_API_KEY
        },
        body: JSON.stringify({
          profesorId: user.id,
          subscription
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Error al guardar la suscripción');
      }

      // 5. Actualizar configuración del profesor
      const configResponse = await fetch(`${env.API_URL}/api/notificaciones/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.INTERNAL_API_KEY
        },
        body: JSON.stringify({
          profesorId: user.id,
          webPushEnabled: true
        })
      });

      const configData = await configResponse.json();

      if (!configResponse.ok) {
        throw new Error(configData.error || configData.details || 'Error al actualizar la configuración');
      }

      alert('¡Notificaciones activadas con éxito!');
    } catch (err) {
      console.error('Error al activar notificaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al activar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Button
        onClick={activarNotificaciones}
        disabled={isLoading}
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        {isLoading ? 'Activando...' : 'Activar Notificaciones'}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 