const CACHE_NAME = "exam-notifier-v1";
const urlsToCache = [
  "/",
  "/mesas",
  "/icon-ucp.png"
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
        return Promise.allSettled(
          urlsToCache.map((url) =>
            fetch(url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return cache.put(url, response);
              })
              .catch((error) => {
                console.warn(`[Service Worker] Error al cachear ${url}:`, error);
                return Promise.resolve();
              })
          )
        );
      })
      .then(() => {
        console.log("[Service Worker] Instalación completada");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[Service Worker] Error durante la instalación:", error);
        return self.skipWaiting();
      })
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
    fetch(event.request, {
      redirect: "follow"
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push recibido:", event);
  if (event.data) {
    const data = event.data.json();
    console.log("[Service Worker] Datos de la notificación:", data);
    const options = {
      body: data.body,
      icon: "/icon-ucp.png",
      badge: "/icon-ucp.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        ...data.data
      },
      actions: [
        {
          action: "explore",
          title: "Ver detalles"
        },
        {
          action: "close",
          title: "Cerrar"
        }
      ],
      timestamp: data.data?.fecha ? new Date(data.data.fecha).getTime() : Date.now(),
      tag: data.data?.mesaId ? `mesa-${data.data.mesaId}` : undefined,
      renotify: true
    };

    // Mostrar siempre el body tal como viene del backend
    options.body = data.body;

    console.log("[Service Worker] Opciones de la notificación:", options);
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/mesas"));
  }
});
