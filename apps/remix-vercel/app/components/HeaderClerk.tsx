import { useState, useEffect } from "react";
import { useFetcher, useRevalidator } from "@remix-run/react";
import {
  SignedIn,
  UserButton,
  useUser,
} from "@clerk/remix";
import { Bell, BellOff, Settings } from "lucide-react";

import { Button } from "@exam-notifier/ui/components/button";
import { Toast } from "@exam-notifier/ui/components/Toast";
import { NotificationConfig } from "~/utils/notification.server";

interface HeaderClerkProps {
  notificationConfig: NotificationConfig;
  userRole: string;
  env: {
    VAPID_PUBLIC_KEY: string;
    API_URL: string;
    INTERNAL_API_KEY: string;
  };
}

interface FetcherData {
  success?: boolean;
  error?: string;
  config?: NotificationConfig;
}

interface LocalNotificationConfig {
  webPushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
}

export function HeaderClerk({ notificationConfig: initialConfig, userRole, env }: HeaderClerkProps) {
  const { VAPID_PUBLIC_KEY, API_URL, INTERNAL_API_KEY } = env;
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const fetcher = useFetcher<FetcherData>();
  const revalidator = useRevalidator();
  const isSubmitting = fetcher.state === "submitting";

  // Estado local para manejar los switches
  const [localConfig, setLocalConfig] = useState<LocalNotificationConfig>({
    webPushEnabled: initialConfig?.webPushEnabled ?? false,
    smsEnabled: initialConfig?.smsEnabled ?? false,
    emailEnabled: initialConfig?.emailEnabled ?? false
  });

  // Cargar configuración del localStorage solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('notificationConfig');
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig);
          setLocalConfig(parsedConfig);
        } catch (error) {
          console.error('Error al parsear la configuración guardada:', error);
        }
      }
    }
  }, []);

  // Guardar cambios en localStorage solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationConfig', JSON.stringify(localConfig));
    }
  }, [localConfig]);

  // Manejar la activación de web push
  const handleWebPushActivation = async () => {
    if (userRole !== "profesor" || !user?.id) return;
    setIsLoading(true);

    try {
      // Verificar soporte de Service Worker
      if (!("serviceWorker" in navigator)) {
        throw new Error("Tu navegador no soporta notificaciones push");
      }

      // Verificar permisos
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permiso de notificaciones denegado");
      }

      // Registrar Service Worker
      const registration = await navigator.serviceWorker.register("/sw.js");

      // Esperar a que el Service Worker esté activo
      if (!registration.active) {
        await new Promise((resolve) => {
          if (registration.active) {
            resolve(true);
          } else {
            registration.addEventListener("activate", () => resolve(true));
          }
        });
      }

      // Obtener suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });

      // Enviar suscripción al backend
      const response = await fetch(
        `${API_URL}/api/diaries/notificaciones/push-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": INTERNAL_API_KEY || "",
          },
          body: JSON.stringify({
            profesorId: user?.id,
            subscription: subscription.toJSON(),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.details || "Error al guardar la suscripción");
      }

      // Actualizar estado local primero
      setLocalConfig((prev: LocalNotificationConfig) => ({
        ...prev,
        webPushEnabled: true
      }));

      // Enviar actualización al servidor en segundo plano
      fetcher.submit(
        {
          type: "webPushEnabled",
          enabled: "true",
        },
        { method: "post" }
      );

    } catch (error) {
      console.error("Error al activar notificaciones:", error);
      // Revertir el estado local en caso de error
      setLocalConfig((prev: LocalNotificationConfig) => ({
        ...prev,
        webPushEnabled: false
      }));
      fetcher.data = { 
        success: false, 
        error: error instanceof Error ? error.message : "Error al activar notificaciones" 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en los switches
  const handleToggleNotification = async (type: keyof LocalNotificationConfig) => {
    if (userRole !== "profesor" || !user?.id) return;

    // Actualizar estado local inmediatamente
    setLocalConfig((prev: LocalNotificationConfig) => ({
      ...prev,
      [type]: !prev[type]
    }));

    try {
      // Enviar actualización al servidor en segundo plano
      const response = await fetch(
        `${API_URL}/api/diaries/notificaciones/config/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": INTERNAL_API_KEY || "",
          },
          body: JSON.stringify({
            [type]: !localConfig[type],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar la configuración");
      }

      // Mostrar mensaje de éxito
      fetcher.data = { 
        success: true,
        config: await response.json()
      };

    } catch (error) {
      console.error("Error al actualizar configuración:", error);
      // Revertir el estado local en caso de error
      setLocalConfig((prev: LocalNotificationConfig) => ({
        ...prev,
        [type]: !prev[type]
      }));
      fetcher.data = { 
        success: false, 
        error: error instanceof Error ? error.message : "Error al actualizar la configuración" 
      };
    }
  };

  const getNotificationMessage = (
    type: keyof LocalNotificationConfig,
    enabled: boolean,
  ) => {
    switch (type) {
      case "webPushEnabled":
        return `Notificaciones del navegador ${enabled ? "activadas" : "desactivadas"}`;
      case "emailEnabled":
        return enabled
          ? "Notificaciones por email activadas. Recibirás un email 24 horas antes de cada mesa."
          : "Notificaciones por email desactivadas";
      case "smsEnabled":
        return enabled
          ? "Notificaciones por WhatsApp activadas. Recibirás un mensaje 24 horas antes de cada mesa."
          : "Notificaciones por WhatsApp desactivadas";
      default:
        return "";
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-white p-4">
      <div>
        <SignedIn>
          <UserButton/>
        </SignedIn>
      </div>
      <div className="flex items-center gap-4">
        <SignedIn>
          {userRole === "profesor" && (
            <div className="relative">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleWebPushActivation}
                  disabled={isSubmitting || localConfig.webPushEnabled || isLoading}
                  className={`flex h-10 w-10 items-center justify-center rounded-full p-0 ${
                    localConfig.webPushEnabled
                      ? "cursor-not-allowed bg-green-600"
                      : isLoading || isSubmitting
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  title={
                    localConfig.webPushEnabled
                      ? "Notificaciones activadas"
                      : isLoading || isSubmitting
                        ? "Activando..."
                        : "Activar notificaciones"
                  }
                >
                  {localConfig.webPushEnabled ? (
                    <Bell className="h-5 w-5 text-white" />
                  ) : isLoading || isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <BellOff className="h-5 w-5 text-white" />
                  )}
                </Button>
                <Button
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 p-0 hover:bg-gray-700"
                  title="Configuración de notificaciones"
                >
                  <Settings className="h-5 w-5 text-white" />
                </Button>
              </div>
              {showConfig && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border bg-white p-4 shadow-lg">
                  <h3 className="mb-4 font-semibold text-gray-800">
                    Configuración de notificaciones
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          Notificaciones del navegador
                        </span>
                        <span className="text-xs text-gray-500">
                          Recibe alertas en tu navegador
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleNotification("webPushEnabled")}
                        disabled={isLoading || isSubmitting}
                        className={`h-6 w-12 rounded-full transition-colors duration-200 ease-in-out ${
                          localConfig.webPushEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                            localConfig.webPushEnabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          Notificaciones WhatsApp
                        </span>
                        <span className="text-xs text-gray-500">
                          Recibe alertas en tu WhatsApp
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleNotification("smsEnabled")}
                        disabled={isLoading || isSubmitting}
                        className={`h-6 w-12 rounded-full transition-colors duration-200 ease-in-out ${
                          localConfig.smsEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                            localConfig.smsEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          Notificaciones por email
                        </span>
                        <span className="text-xs text-gray-500">
                          Recibe alertas en tu correo
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleNotification("emailEnabled")}
                        disabled={isLoading || isSubmitting}
                        className={`h-6 w-12 rounded-full transition-colors duration-200 ease-in-out ${
                          localConfig.emailEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                            localConfig.emailEnabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </SignedIn>
        <img src="/icon-ucp.png" alt="Logo" className="h-12 w-12" />
      </div>
      {fetcher.data?.error && (
        <Toast
          message={fetcher.data.error}
          type="error"
          onClose={() => fetcher.data = undefined}
        />
      )}
      {fetcher.data?.success && (
        <Toast
          message="Configuración actualizada correctamente"
          type="success"
          onClose={() => fetcher.data = undefined}
        />
      )}
    </header>
  );
}

export default HeaderClerk;
