import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/remix";
import { Bell, BellOff, Settings } from "lucide-react";
import { Button } from "@exam-notifier/ui/components/button";
import { Toast } from "@exam-notifier/ui/components/Toast";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/remix";
import { useLoaderData } from "@remix-run/react";

interface LoaderData {
  env: {
    VAPID_PUBLIC_KEY: string;
    INTERNAL_API_KEY: string;
  };
}

interface NotificationConfig {
  webPushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
}

export function HeaderClerk() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>({
    webPushEnabled: false,
    smsEnabled: false,
    emailEnabled: false
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const { user } = useUser();
  const { env } = useLoaderData<LoaderData>();

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`http://localhost:3001/api/notificaciones/config/${user.id}`, {
          headers: {
            'x-api-key': env.INTERNAL_API_KEY
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setConfig({
            webPushEnabled: data.webPushEnabled || false,
            smsEnabled: data.smsEnabled || false,
            emailEnabled: data.emailEnabled || false
          });
          setIsSubscribed(data.webPushEnabled || false);
        }
      } catch (error) {
        console.error('Error al obtener configuración:', error);
      }
    };

    fetchConfig();
  }, [user?.id, env.INTERNAL_API_KEY]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const updateNotificationConfig = async (fields: Partial<NotificationConfig>) => {
    if (!user?.id) return;
    await fetch(`http://localhost:3001/api/notificaciones/config/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.INTERNAL_API_KEY
      },
      body: JSON.stringify(fields)
    });
  };

  const handleToggleNotification = async (type: keyof NotificationConfig) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const newConfig = {
        ...config,
        [type]: !config[type]
      };

      const getNotificationMessage = (type: keyof NotificationConfig, enabled: boolean) => {
        switch (type) {
          case 'webPushEnabled':
            return `Notificaciones del navegador ${enabled ? 'activadas' : 'desactivadas'}`;
          case 'emailEnabled':
            return enabled 
              ? 'Notificaciones por email activadas. Recibirás un email 24 horas antes de cada mesa.'
              : 'Notificaciones por email desactivadas';
          case 'smsEnabled':
            return enabled 
              ? 'Notificaciones por WhatsApp activadas. Recibirás un mensaje 24 horas antes de cada mesa.'
              : 'Notificaciones por WhatsApp desactivadas';
          default:
            return '';
        }
      };

      if (type === 'webPushEnabled' && newConfig.webPushEnabled) {
        if (!('serviceWorker' in navigator)) {
          throw new Error('Tu navegador no soporta notificaciones push');
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permiso de notificaciones denegado');
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: env.VAPID_PUBLIC_KEY
        });

        try {
          const response = await fetch('http://localhost:3001/api/notificaciones/push-subscription', {
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

          if (!response.ok) {
            throw new Error('Error al registrar la suscripción');
          }
        } catch (error) {
          console.error('Error al registrar suscripción:', error);
          newConfig.webPushEnabled = false;
          throw new Error('No se pudo registrar la suscripción. Por favor, intenta nuevamente.');
        }
      }

      try {
        await updateNotificationConfig({ [type]: newConfig[type] });

        setConfig(newConfig);
        setIsSubscribed(newConfig.webPushEnabled);
        showNotification(getNotificationMessage(type, newConfig[type]), 'success');
      } catch (error) {
        console.error('Error al actualizar configuración:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al actualizar configuración';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar configuración';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const waitForServiceWorker = async (registration: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando activación del Service Worker'));
      }, 10000);

      console.log('Estado inicial del Service Worker:', {
        active: !!registration.active,
        installing: !!registration.installing,
        waiting: !!registration.waiting,
        scope: registration.scope
      });

      if (registration.active) {
        console.log('Service Worker ya está activo');
        clearTimeout(timeout);
        resolve(registration);
        return;
      }

      const checkState = () => {
        console.log('Verificando estado del Service Worker:', {
          active: !!registration.active,
          installing: !!registration.installing,
          waiting: !!registration.waiting
        });

        if (registration.active) {
          console.log('Service Worker activado');
          clearTimeout(timeout);
          resolve(registration);
          return true;
        }
        return false;
      };

      if (checkState()) return;

      registration.addEventListener('updatefound', () => {
        console.log('Service Worker actualización encontrada');
        if (registration.installing) {
          registration.installing.addEventListener('statechange', () => {
            console.log('Estado del Service Worker cambiado:', registration.installing?.state);
            if (registration.installing?.state === 'installed') {
              console.log('Service Worker instalado, forzando activación');
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            }
            checkState();
          });
        }
      });

      const interval = setInterval(() => {
        if (checkState()) {
          clearInterval(interval);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
      }, 10000);
    });
  };

  const handleNotificationToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !env?.VAPID_PUBLIC_KEY || !env?.INTERNAL_API_KEY) {
      setError('Configuración incompleta');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers no soportados');
      }

      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Service Workers existentes:', registrations.length);
      
      for (const registration of registrations) {
        console.log('Desregistrando Service Worker:', registration.scope);
        await registration.unregister();
      }

      console.log('Registrando nuevo Service Worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registrado:', registration);

      try {
        await waitForServiceWorker(registration);
        console.log('Service Worker activado exitosamente');
      } catch (error) {
        console.error('Error esperando activación:', error);
        throw new Error('No se pudo activar el Service Worker');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permiso de notificaciones denegado');
      }

      if (!isSubscribed) {
        console.log('Intentando suscribirse...');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: env.VAPID_PUBLIC_KEY
        });

        console.log('Suscripción creada:', subscription);

        await fetch('http://localhost:3001/api/notificaciones/push-subscription', {
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

        setIsSubscribed(true);
        showNotification('¡Notificaciones activadas con éxito!', 'success');
      } else {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setIsSubscribed(false);
          showNotification('Notificaciones desactivadas', 'success');
        }
      }
    } catch (error) {
      console.error('Error al manejar notificaciones:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/profesores/telefono', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.INTERNAL_API_KEY
        },
        body: JSON.stringify({
          profesorId: user?.id,
          telefono: phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el número de teléfono');
      }

      setIsEditingPhone(false);
      showNotification('Número de teléfono actualizado', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification(error instanceof Error ? error.message : 'Error al actualizar teléfono', 'error');
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-white p-4">
      <div>
        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="text-sm font-semibold">Iniciar sesión</button>
          </SignInButton>
        </SignedOut>
      </div>
      <div className="flex items-center gap-4">
        <SignedIn>
          <div className="relative">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleToggleNotification('webPushEnabled')}
                disabled={isLoading || config.webPushEnabled}
                className={`w-10 h-10 rounded-full p-0 flex items-center justify-center ${
                  config.webPushEnabled 
                    ? 'bg-green-600 cursor-not-allowed' 
                    : isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={config.webPushEnabled ? 'Notificaciones activadas' : isLoading ? 'Activando...' : 'Activar notificaciones'}
              >
                {config.webPushEnabled ? (
                  <Bell className="h-5 w-5 text-white" />
                ) : isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <BellOff className="h-5 w-5 text-white" />
                )}
              </Button>
              <Button
                onClick={() => setShowConfig(!showConfig)}
                className="w-10 h-10 rounded-full p-0 flex items-center justify-center bg-gray-600 hover:bg-gray-700"
                title="Configuración de notificaciones"
              >
                <Settings className="h-5 w-5 text-white" />
              </Button>
            </div>
            {error && (
              <div className="absolute top-full right-0 mt-2 bg-red-100 text-red-600 text-xs p-2 rounded shadow-lg z-50 whitespace-nowrap">
                {error}
              </div>
            )}
            {showConfig && (
              <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-72 z-50">
                <h3 className="font-semibold mb-4 text-gray-800">Configuración de notificaciones</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Notificaciones del navegador</span>
                      <span className="text-xs text-gray-500">Recibe alertas en tu navegador</span>
                    </div>
                    <button
                      onClick={() => handleToggleNotification('webPushEnabled')}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                        config.webPushEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        config.webPushEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Notificaciones WhatsApp</span>
                      <span className="text-xs text-gray-500">Recibe alertas en tu WhatsApp</span>
                    </div>
                    <button
                      onClick={() => handleToggleNotification('smsEnabled')}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                        config.smsEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        config.smsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Notificaciones por email</span>
                      <span className="text-xs text-gray-500">Recibe alertas en tu correo</span>
                    </div>
                    <button
                      onClick={() => handleToggleNotification('emailEnabled')}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                        config.emailEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        config.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SignedIn>
        <img src="/icon-ucp.png" alt="Logo" className="h-12 w-12" />
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </header>
  );
}

export default HeaderClerk;

