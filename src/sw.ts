/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// self.__WB_MANIFEST is injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache static assets (scripts, styles, images, fonts)
registerRoute(
  ({ request }) => ['script', 'style', 'image', 'font'].includes(request.destination),
  new CacheFirst({ cacheName: 'static-cache' })
);

// Cache API responses with a network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-cache' })
);

export {};
