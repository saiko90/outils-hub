/* calorio — service worker (Web Push : rappels repas + encouragements Pro) */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "calorio 🥕";
  const options = {
    body: data.body || "",
    icon: "/calorio-icon-192.png",
    badge: "/calorio-badge.png",
    tag: data.tag || "calorio",
    renotify: true,
    data: { url: data.url || "/calorio" },
    vibrate: [70, 40, 70],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/calorio";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate && c.navigate(target);
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});

/* ---- Cache hors-ligne (app-shell) ---- */
const CACHE = "calorio-cache-v2"; // changer de version purge l'ancien cache à l'activation
const PRECACHE = ["/calorio", "/calorio-icon-192.png", "/calorio-icon-180.png", "/calorio.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;          // tiers (fonts, OFF…) : laisser le réseau
  if (url.pathname.startsWith("/api/")) return;             // API : jamais de cache
  if (url.pathname === "/sw.js") return;

  // Navigations : réseau d'abord, repli sur la page en cache (offline).
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); return res; })
        .catch(() => caches.match(req).then((m) => m || caches.match("/calorio")))
    );
    return;
  }

  // Assets same-origin (JS/CSS/images/police) : cache d'abord + mise à jour en arrière-plan.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => { if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); } return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
