/**
 * Minimal offline cache. The app is pure client-side math, so once the shell is
 * cached it works with no network at all.
 *
 * Strategy:
 *  - navigations: network first, fall back to the cached shell (so a deep link
 *    still opens offline), and always refresh the cached shell when online.
 *  - hashed build assets: cache first (their URL changes when they change).
 */
const CACHE = 'loanwise-v1'
const SHELL = '/index.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([SHELL, '/', '/favicon.svg', '/manifest.webmanifest'])),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Drop caches from previous versions.
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(CACHE).then((cache) => cache.put(SHELL, response.clone()))
          return response
        })
        .catch(() => caches.match(SHELL).then((cached) => cached ?? Response.error())),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          // Only cache successful same-origin responses.
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()))
          return response
        }),
    ),
  )
})
