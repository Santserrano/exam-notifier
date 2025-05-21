const CACHE_NAME = "exam-notifier-v1";
const urlsToCache = [
  "/",
  "/mesas",
  "/icon-ucp.png",
  "/checkmark.png",
  "/xmark.png",
];

// Forzar la activación inmediata
self.skipWaiting();

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Instalando...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Cache abierto");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("[Service Worker] Cache completado");
        return self.skipWaiting(); // Fuerza la activación inmediata
      })
      .catch((error) => {
        console.error("[Service Worker] Error durante la instalación:", error);
      }),
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activando...");
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguas
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log(
                "[Service Worker] Eliminando cache antigua:",
                cacheName,
              );
              return caches.delete(cacheName);
            }
          }),
        );
      }),
      // Tomar control inmediatamente
      self.clients.claim(),
    ]).then(() => {
      console.log("[Service Worker] Activación completada");
      // Notificar a todos los clientes que el Service Worker está activo
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SW_ACTIVATED" });
        });
      });
    }),
  );
});

self.addEventListener("message", (event) => {
  console.log("[Service Worker] Mensaje recibido:", event.data);
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[Service Worker] Forzando activación...");
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    }),
  );
});

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icon-ucp.png",
      badge: "/icon-ucp.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: "explore",
          title: "Ver detalles",
          icon: "/checkmark.png",
        },
        {
          action: "close",
          title: "Cerrar",
          icon: "/xmark.png",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/mesas"));
  }
});
