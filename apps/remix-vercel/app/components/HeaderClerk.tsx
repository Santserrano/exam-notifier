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

interface Props {
  notificationConfig: {
    webPushEnabled?: boolean;
    smsEnabled?: boolean;
    emailEnabled?: boolean;
  } | null;
  userRole?: string;
  env?: {
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

export function HeaderClerk({ notificationConfig: initialConfig, userRole, env }: Props) {
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const fetcher = useFetcher<FetcherData>();
  const revalidator = useRevalidator();
  const isSubmitting = fetcher.state === "submitting";

  // Usar el estado del fetcher directamente, con fallback a initialConfig
  const notificationConfig = {
    webPushEnabled: fetcher.data?.config?.webPushEnabled ?? initialConfig?.webPushEnabled ?? false,
    smsEnabled: fetcher.data?.config?.smsEnabled ?? initialConfig?.smsEnabled ?? false,
    emailEnabled: fetcher.data?.config?.emailEnabled ?? initialConfig?.emailEnabled ?? false
  };

  // Revalidar cuando el fetcher tenga éxito
  useEffect(() => {
    if (fetcher.data?.success) {
      revalidator.revalidate();
    }
  }, [fetcher.data, revalidator]);

  const handleToggleNotification = async (type: keyof NotificationConfig) => {
    if (userRole !== "profesor" || !user?.id) return;

    if (type === "webPushEnabled" && !notificationConfig?.[type]) {
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
        console.log("Registrando Service Worker...");
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registrado:", registration);

        // Esperar a que el Service Worker esté activo
        if (!registration.active) {
          console.log("Esperando a que el Service Worker esté activo...");
          await new Promise((resolve) => {
            if (registration.active) {
              resolve(true);
            } else {
              registration.addEventListener("activate", () => resolve(true));
            }
          });
        }

        // Obtener suscripción
        console.log("Intentando obtener suscripción...");
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: env?.VAPID_PUBLIC_KEY,
        });

        console.log("Suscripción obtenida:", subscription);

        // Enviar suscripción al backend
        const response = await fetch(
          `${env?.API_URL}/api/diaries/notificaciones/push-subscription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": env?.INTERNAL_API_KEY || "",
            },
            body: JSON.stringify({
              profesorId: user?.id,
              subscription: subscription.toJSON(),
            }),
          }
        );

        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        if (!response.ok) {
          throw new Error(data.error || data.details || "Error al guardar la suscripción");
        }

        fetcher.submit(
          {
            type: "webPushEnabled",
            enabled: "true",
          },
          { method: "post" }
        );
      } catch (error) {
        console.error("Error al activar notificaciones:", error);
        fetcher.data = { 
          success: false, 
          error: error instanceof Error ? error.message : "Error al activar notificaciones" 
        };
      } finally {
        setIsLoading(false);
      }
    } else {
      fetcher.submit(
        {
          type,
          enabled: (!notificationConfig?.[type]).toString(),
        },
        { method: "post" }
      );
    }
  };

  const getNotificationMessage = (
    type: keyof NotificationConfig,
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
                  onClick={() => handleToggleNotification("webPushEnabled")}
                  disabled={isSubmitting || notificationConfig?.webPushEnabled || isLoading}
                  className={`flex h-10 w-10 items-center justify-center rounded-full p-0 ${
                    notificationConfig?.webPushEnabled
                      ? "cursor-not-allowed bg-green-600"
                      : isLoading || isSubmitting
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  title={
                    notificationConfig?.webPushEnabled
                      ? "Notificaciones activadas"
                      : isLoading || isSubmitting
                        ? "Activando..."
                        : "Activar notificaciones"
                  }
                >
                  {notificationConfig?.webPushEnabled ? (
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
                          notificationConfig?.webPushEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                            notificationConfig?.webPushEnabled
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
                          notificationConfig?.smsEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                            notificationConfig?.smsEnabled ? "translate-x-6" : "translate-x-1"
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
                          notificationConfig?.emailEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                            notificationConfig?.emailEnabled
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
