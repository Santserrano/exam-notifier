import { useState } from "react";
import { useFetcher } from "@remix-run/react";
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
  notificationConfig: NotificationConfig | null;
}

interface FetcherData {
  error?: string;
  message?: string;
}

export function HeaderClerk({ notificationConfig }: Props) {
  const [showConfig, setShowConfig] = useState(false);
  const { user } = useUser();
  const { ENV } = useLoaderData<{ ENV: { API_URL: string; VAPID_PUBLIC_KEY: string; INTERNAL_API_KEY: string } }>();
  const fetcher = useFetcher<FetcherData>();
  const isSubmitting = fetcher.state === "submitting";

  const handleToggleNotification = async (type: keyof NotificationConfig) => {
    if (!user?.id) return;

    if (type === "webPushEnabled" && !notificationConfig?.webPushEnabled) {
      if (!("serviceWorker" in navigator)) {
        fetcher.data = { error: "Tu navegador no soporta notificaciones push" };
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        fetcher.data = { error: "Permiso de notificaciones denegado" };
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: ENV.VAPID_PUBLIC_KEY,
      });

      fetcher.submit(
        {
          intent: "toggleNotifications",
          type,
          subscription: JSON.stringify(subscription),
          enabled: "true",
        },
        { method: "post" }
      );
    } else {
      fetcher.submit(
        {
          intent: "toggleNotifications",
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
          <div className="relative">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleToggleNotification("webPushEnabled")}
                disabled={isSubmitting || notificationConfig?.webPushEnabled}
                className={`flex h-10 w-10 items-center justify-center rounded-full p-0 ${
                  notificationConfig?.webPushEnabled
                    ? "cursor-not-allowed bg-green-600"
                    : isSubmitting
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={
                  notificationConfig?.webPushEnabled
                    ? "Notificaciones activadas"
                    : isSubmitting
                      ? "Activando..."
                      : "Activar notificaciones"
                }
              >
                {notificationConfig?.webPushEnabled ? (
                  <Bell className="h-5 w-5 text-white" />
                ) : isSubmitting ? (
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
            {fetcher.data?.error && (
              <div className="absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded bg-red-100 p-2 text-xs text-red-600 shadow-lg">
                {fetcher.data.error}
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
        </SignedIn>
        <img src="/icon-ucp.png" alt="Logo" className="h-12 w-12" />
      </div>
      {fetcher.data?.message && (
        <Toast
          message={fetcher.data.message}
          type={fetcher.data.error ? "error" : "success"}
          onClose={() => fetcher.data = undefined}
        />
      )}
    </header>
  );
}

export default HeaderClerk;
