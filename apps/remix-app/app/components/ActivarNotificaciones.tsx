import { useState, useEffect } from 'react';
import { Button } from '@exam-notifier/ui/components/button';
import { Toast } from '@exam-notifier/ui/components/Toast';
import { useUser } from '@clerk/remix';
import { useLoaderData } from '@remix-run/react';
import { Bell, BellOff } from 'lucide-react';

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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const { user } = useUser();
  const { env } = useLoaderData<LoaderData>();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('Error al verificar suscripción:', err);
      }
    };

    checkSubscription();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

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

    if (isSubscribed) {
      setError('Ya tienes las notificaciones activadas');
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

      setIsSubscribed(true);
      showNotification('¡Notificaciones activadas con éxito!', 'success');
    } catch (err) {
      console.error('Error al activar notificaciones:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al activar notificaciones';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={activarNotificaciones}
        disabled={isLoading || isSubscribed}
        className={`w-10 h-10 rounded-full p-0 flex items-center justify-center ${
          isSubscribed 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        title={isSubscribed ? 'Notificaciones activadas' : 'Activar notificaciones'}
      >
        {isSubscribed ? (
          <Bell className="h-5 w-5 text-white" />
        ) : (
          <BellOff className="h-5 w-5 text-white" />
        )}
      </Button>
      {error && (
        <div className="absolute top-full right-0 mt-2 bg-red-100 text-red-600 text-xs p-2 rounded shadow-lg z-50 whitespace-nowrap">
          {error}
        </div>
      )}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
} 