import { useEffect, useState } from "react";
import { useUser } from "@clerk/remix";
import { useLoaderData } from "@remix-run/react";
import { Bell, BellOff } from "lucide-react";

import { Button } from "@exam-notifier/ui/components/button";
import { Toast } from "@exam-notifier/ui/components/Toast";

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
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const { user } = useUser();
  const { env } = useLoaderData<LoaderData>();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        if (!("serviceWorker" in navigator)) {
          throw new Error("Service Workers no soportados en este navegador");
        }

        if (!env?.API_URL || !env?.INTERNAL_API_KEY) {
          console.error("Variables de entorno no disponibles:", { env });
          return;
        }

        console.log("Verificando suscripción con:", {
          apiUrl: env.API_URL,
          userId: user?.id,
        });

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          // Verificar si la suscripción está activa en el backend
          const url = `${env.API_URL}/api/notificaciones/config/${user?.id}`;
          console.log("Consultando configuración en:", url);

          const response = await fetch(url, {
            headers: {
              "x-api-key": env.INTERNAL_API_KEY,
              "Content-Type": "application/json",
            },
          }).catch((error: unknown) => {
            console.error("Error en la petición:", error);
            throw new Error(`Error de conexión: ${error instanceof Error ? error.message : ''}`);
          });

          if (response.ok) {
            const config = await response.json();
            console.log("Configuración recibida:", config);
            setIsSubscribed(config.webPushEnabled);
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("Error en la respuesta:", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            throw new Error(`Error del servidor: ${response.statusText}`);
          }
        } else {
          console.log("No hay suscripción activa");
          setIsSubscribed(false);
        }
      } catch (err) {
        console.error("Error al verificar suscripción:", err);
        setError(
          err instanceof Error ? err.message : "Error al verificar suscripción",
        );
        setIsSubscribed(false);
      }
    };

    if (user && env?.API_URL && env?.INTERNAL_API_KEY) {
      void checkSubscription();
    }
  }, [user, env?.API_URL, env?.INTERNAL_API_KEY]);

  const showNotification = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const activarNotificaciones = async () => {
    if (!user) {
      setError("Debes iniciar sesión para activar las notificaciones");
      return;
    }

    if (!env?.VAPID_PUBLIC_KEY) {
      setError("Error de configuración: VAPID_PUBLIC_KEY no está definida");
      return;
    }

    if (!env?.INTERNAL_API_KEY) {
      setError("Error de configuración: INTERNAL_API_KEY no está definida");
      return;
    }

    if (!env?.API_URL) {
      setError("Error de configuración: API_URL no está definida");
      return;
    }

    if (isSubscribed) {
      setError("Ya tienes las notificaciones activadas");
      return;
    }

    setIsLoading(true);
    setError(null);

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
      if (registration.active) {
        console.log("Service Worker ya está activo");
      } else {
        console.log("Esperando a que el Service Worker esté activo...");
        await new Promise((resolve) => {
          if (registration.active) {
            resolve(true);
          } else {
            registration.addEventListener("activate", () => { resolve(true); });
          }
        });
      }

      // Obtener suscripción
      console.log("Intentando obtener suscripción...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: env.VAPID_PUBLIC_KEY,
      });

      console.log("Suscripción obtenida:", subscription);

      // Enviar suscripción al backend
      const response = await fetch(
        `${env.API_URL}/api/notificaciones/push-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.INTERNAL_API_KEY || "",
          },
          body: JSON.stringify({
            profesorId: user?.id,
            subscription,
          }),
        },
      );

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "Error al guardar la suscripción",
        );
      }

      if (!data.success) {
        throw new Error("La operación no fue exitosa");
      }

      if (!data.config || !data.config.webPushEnabled) {
        throw new Error("La configuración no se activó correctamente");
      }

      setIsSubscribed(true);
      showNotification("¡Notificaciones activadas con éxito!", "success");
    } catch (error) {
      console.error("Error al activar notificaciones:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al activar notificaciones";
      setError(errorMessage);
      showNotification(errorMessage, "error");
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!env?.API_URL || !env?.INTERNAL_API_KEY || !env?.VAPID_PUBLIC_KEY) {
    console.error("Variables de entorno faltantes:", { env });
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={activarNotificaciones}
        disabled={isLoading || isSubscribed}
        className={`flex h-10 w-10 items-center justify-center rounded-full p-0 ${
          isSubscribed
            ? "bg-green-600 hover:bg-green-700"
            : isLoading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={
          isSubscribed
            ? "Notificaciones activadas"
            : isLoading
              ? "Activando..."
              : "Activar notificaciones"
        }
      >
        {isSubscribed ? (
          <Bell className="h-5 w-5 text-white" />
        ) : isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <BellOff className="h-5 w-5 text-white" />
        )}
      </Button>
      {error && (
        <div className="absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded bg-red-100 p-2 text-xs text-red-600 shadow-lg">
          {error}
        </div>
      )}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => { setShowToast(false); }}
        />
      )}
    </div>
  );
}
