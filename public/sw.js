self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'schedule') return;
  const items = data.items || [];
  items.forEach((item) => {
    const time = new Date(item.due + 'T09:00:00').getTime() - Date.now();
    const delay = Math.max(0, time);
    setTimeout(() => {
      self.registration.showNotification(item.title, { body: `Due ${item.due}` });
    }, delay);
  });
});
