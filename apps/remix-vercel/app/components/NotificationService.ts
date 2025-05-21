//SW
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado:", registration);
      return registration;
    } catch (error) {
      console.error("Error al registrar el Service Worker:", error);
      throw error;
    }
  }
  throw new Error("Service Workers no soportados en este navegador");
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    throw new Error("Este navegador no soporta notificaciones");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permiso de notificación denegado");
  }

  return permission;
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
) {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.VAPID_PUBLIC_KEY,
    });

    // Enviar la suscripción al servidor
    await fetch("/api/push-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error("Error al suscribirse a las notificaciones push:", error);
    throw error;
  }
}
