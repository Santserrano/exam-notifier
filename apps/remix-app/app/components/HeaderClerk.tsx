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
    API_URL: string;
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
        const response = await fetch(`${env.API_URL}/api/diaries/notificaciones/config/${user.id}`, {
          headers: {
            'x-api-key': env.INTERNAL_API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al obtener configuración: ${response.statusText}`);
        }

        const data = await response.json();
        
        setConfig({
          webPushEnabled: data.webPushEnabled || false,
          smsEnabled: data.smsEnabled || false,
          emailEnabled: data.emailEnabled || false
        });
        setIsSubscribed(data.webPushEnabled || false);
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Error al obtener configuración', 'error');
      }
    };

    void fetchConfig();
  }, [user?.id, env.INTERNAL_API_KEY, env.API_URL]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleToggleNotification = async (type: 'webPush' | 'email' | 'whatsapp') => {
    if (!user?.id) {
      showNotification('No hay usuario autenticado', 'error');
      return;
    }

    try {
      if (type === 'webPush') {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          showNotification('Push notifications no soportadas', 'error');
          return;
        }

        // Registrar el Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');

        // Obtener la suscripción actual
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // Crear nueva suscripción
          const publicKey = env.VAPID_PUBLIC_KEY;
          if (!publicKey) {
            showNotification('Error en la configuración de notificaciones', 'error');
            return;
          }

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
          });

          // Enviar la suscripción al servidor
          const response = await fetch(`${env.API_URL}/api/diaries/notificaciones/push-subscription`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': env.INTERNAL_API_KEY
            },
            body: JSON.stringify({
              profesorId: user.id,
              subscription: subscription.toJSON()
            })
          });

          if (!response.ok) {
            throw new Error('Error al guardar suscripción');
          }
        }

        // Actualizar la configuración
        const configResponse = await fetch(`${env.API_URL}/api/diaries/notificaciones/config/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.INTERNAL_API_KEY
          },
          body: JSON.stringify({
            webPushEnabled: true
          })
        });

        if (!configResponse.ok) {
          throw new Error('Error al actualizar configuración');
        }

        const updatedConfig = await configResponse.json();
        setConfig(updatedConfig);
        showNotification('Notificaciones activadas correctamente', 'success');
      } else {
        // Actualizar configuración para email o WhatsApp
        const configResponse = await fetch(`${env.API_URL}/api/diaries/notificaciones/config/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.INTERNAL_API_KEY
          },
          body: JSON.stringify({
            [type === 'email' ? 'emailEnabled' : 'smsEnabled']: !config[type === 'email' ? 'emailEnabled' : 'smsEnabled']
          })
        });

        if (!configResponse.ok) {
          throw new Error('Error al actualizar configuración');
        }

        const updatedConfig = await configResponse.json();
        setConfig(updatedConfig);
        showNotification(`${type === 'email' ? 'Email' : 'WhatsApp'} ${updatedConfig[type === 'email' ? 'emailEnabled' : 'smsEnabled'] ? 'activado' : 'desactivado'}`, 'success');
      }
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Error al actualizar notificaciones', 'error');
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber) return;
    
    try {
      const response = await fetch(`${env.API_URL}/api/diaries/profesores/telefono`, {
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
                onClick={() => handleToggleNotification('webPush')}
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
                onClick={() => { setShowConfig(!showConfig); }}
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
                      onClick={() => handleToggleNotification('webPush')}
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
                      onClick={() => handleToggleNotification('whatsapp')}
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
                      onClick={() => handleToggleNotification('email')}
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
          onClose={() => { setShowToast(false); }}
        />
      )}
    </header>
  );
}

export default HeaderClerk;