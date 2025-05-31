import { useEffect, useState } from "react";
import {
  SignedIn,
  UserButton,
  useUser,
} from "@clerk/remix";
import { useLoaderData } from "@remix-run/react";
import { Bell, BellOff, Settings } from "lucide-react";

import { Button } from "@exam-notifier/ui/components/button";
import { Toast } from "@exam-notifier/ui/components/Toast";
import { NotificationConfig } from "~/utils/notification.server";

interface Props {
  notificationConfig: NotificationConfig;
}

export function HeaderClerk({ notificationConfig }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>(notificationConfig);
  const { user } = useUser();
  const { ENV } = useLoaderData<{ ENV: { API_URL: string; VAPID_PUBLIC_KEY: string; INTERNAL_API_KEY: string } }>();

  const showNotification = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const updateNotificationConfig = async (
    fields: Partial<NotificationConfig>,
  ) => {
    if (!user?.id) return;
    await fetch(`${ENV.API_URL}/api/notificaciones/config/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ENV.INTERNAL_API_KEY,
      },
      body: JSON.stringify(fields),
    });
  };

  const handleToggleNotification = async (type: keyof NotificationConfig) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const newConfig = {
        ...config,
        [type]: !config[type],
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

      if (type === "webPushEnabled" && newConfig.webPushEnabled) {
        if (!("serviceWorker" in navigator)) {
          throw new Error("Tu navegador no soporta notificaciones push");
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          throw new Error("Permiso de notificaciones denegado");
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: ENV.VAPID_PUBLIC_KEY,
        });

        try {
          const response = await fetch(
            `${ENV.API_URL}/api/notificaciones/push-subscription`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": ENV.INTERNAL_API_KEY,
              },
              body: JSON.stringify({
                profesorId: user.id,
                subscription,
              }),
            },
          );

          if (!response.ok) {
            throw new Error("Error al registrar la suscripción");
          }
        } catch (error) {
          console.error("Error al registrar suscripción:", error);
          newConfig.webPushEnabled = false;
          throw new Error(
            "No se pudo registrar la suscripción. Por favor, intenta nuevamente.",
          );
        }
      }

      try {
        await updateNotificationConfig({ [type]: newConfig[type] });

        setConfig(newConfig);
        showNotification(
          getNotificationMessage(type, newConfig[type]),
          "success",
        );
      } catch (error) {
        console.error("Error al actualizar configuración:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al actualizar configuración";
        setError(errorMessage);
        showNotification(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al actualizar configuración";
      setError(errorMessage);
      showNotification(errorMessage, "error");
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
          <div className="relative">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleToggleNotification("webPushEnabled")}
                disabled={isLoading || config.webPushEnabled}
                className={`flex h-10 w-10 items-center justify-center rounded-full p-0 ${
                  config.webPushEnabled
                    ? "cursor-not-allowed bg-green-600"
                    : isLoading
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={
                  config.webPushEnabled
                    ? "Notificaciones activadas"
                    : isLoading
                      ? "Activando..."
                      : "Activar notificaciones"
                }
              >
                {config.webPushEnabled ? (
                  <Bell className="h-5 w-5 text-white" />
                ) : isLoading ? (
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
            {error && (
              <div className="absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded bg-red-100 p-2 text-xs text-red-600 shadow-lg">
                {error}
              </div>
            )}
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
                      className={`h-6 w-12 rounded-full transition-colors duration-200 ease-in-out ${
                        config.webPushEnabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                          config.webPushEnabled
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
                      className={`h-6 w-12 rounded-full transition-colors duration-200 ease-in-out ${
                        config.smsEnabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                          config.smsEnabled ? "translate-x-6" : "translate-x-1"
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
                      className={`h-6 w-12 rounded-full transition-colors duration-200 ease-in-out ${
                        config.emailEnabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                          config.emailEnabled
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
