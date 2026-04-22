const VERSION = "fantadc-pwa-v1";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const ASSET_CACHE_PATTERNS = [
  /^\/_next\/static\//,
  /^\/icons\//,
  /\.(?:css|js|woff2?|png|jpg|jpeg|svg|ico)$/i,
];

const IS_DEV = ["localhost", "127.0.0.1"].includes(self.location.hostname);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("push", (event) => {
  const payload = (() => {
    if (!event.data) {
      return null;
    }

    try {
      return event.data.json();
    } catch {
      return null;
    }
  })();

  if (!payload?.title) {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/icons/icon-192.png",
      badge: payload.badge || "/icons/icon-192.png",
      tag: payload.tag,
      data: {
        url: payload.url || "/dashboard",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  const targetUrl = new URL(event.notification.data?.url || "/dashboard", self.location.origin).toString();

  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          if (client.url === targetUrl) {
            return client.focus();
          }

          if (client.url.startsWith(self.location.origin) && "navigate" in client) {
            await client.navigate(targetUrl);
            return client.focus();
          }
        }
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (ASSET_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(handleAssetRequest(request));
  }
});

async function handleNavigationRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    if (IS_DEV) {
      console.warn("[Fantadc PWA] Navigation request failed, serving offline fallback.", error);
    }

    const cache = await caches.open(STATIC_CACHE);
    return (await cache.match(OFFLINE_URL)) ?? Response.error();
  }
}

async function handleAssetRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchAndCache = () =>
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      })
      .catch(() => {
        // Network failures are expected offline: fall back to the last cached asset when present.
        return cachedResponse;
      });

  if (cachedResponse) {
    void fetchAndCache().catch((error) => {
      if (IS_DEV) {
        console.warn("[Fantadc PWA] Background asset refresh failed.", error);
      }
    });
    return cachedResponse;
  }

  return fetchAndCache();
}
