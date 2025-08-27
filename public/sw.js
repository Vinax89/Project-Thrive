self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      await showDueNotifications();
      await registerSync();
    })()
  );
});

const DB_NAME = 'notification-db';
const STORE_NAME = 'notifications';
const SYNC_TAG = 'notification-sync';
const SYNC_INTERVAL = 60 * 60 * 1000;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function addNotification(data) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).add(data);
  });
}

async function registerSync() {
  if ('periodicSync' in self.registration) {
    const tags = await self.registration.periodicSync.getTags();
    if (!tags.includes(SYNC_TAG)) {
      try {
        await self.registration.periodicSync.register(SYNC_TAG, {
          minInterval: SYNC_INTERVAL
        });
      } catch {
        /* periodic sync may be unavailable */
      }
    }
  }
}

async function getDueNotifications() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const now = Date.now();
      const all = request.result;
      const due = all.filter((n) => n.timestamp <= now);
      due.forEach((n) => store.delete(n.id));
      resolve(due);
    };
  });
}

async function showDueNotifications() {
  const due = await getDueNotifications();
  for (const note of due) {
    await self.registration.showNotification(note.title, note.options || {});
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'schedule') {
    event.waitUntil(
      (async () => {
        await addNotification(event.data.payload);
        await registerSync();
      })()
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(showDueNotifications());
  }
});
