self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const DB_NAME = 'notification-db';
const STORE_NAME = 'notifications';

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
    event.waitUntil(addNotification(event.data.payload));
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(showDueNotifications());
  }
});
