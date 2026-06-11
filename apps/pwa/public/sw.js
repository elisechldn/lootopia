self.addEventListener('push', function (event) {
  if (event.data) {
    let payload;

    try {
      payload = event.data.json();
    } catch (e) {
      payload = {
        title: event.data.text(),
      }
    }
    const options = {
      body: payload.body || 'You have a new notification.',
      icon: payload.icon || '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(self.registration.showNotification(payload.title || 'Notification Lootopia', options))
  }
})
 
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  event.waitUntil(clients.openWindow('<urlARemplacer>'))
})