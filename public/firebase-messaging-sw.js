importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCoPZ3_Ktah8UBBSgh0_OXL5SQwUtL6Wok",
  authDomain: "menumitra-83831.firebaseapp.com",
  projectId: "menumitra-83831",
  storageBucket: "menumitra-83831.appspot.com",
  messagingSenderId: "851450497367",
  appId: "1:851450497367:web:e2347945f3decce56a9612",
  measurementId: "G-Q6V5R4EDYT"
});

const messaging = firebase.messaging();

self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    data: {
      messageType: 'background'
    }
  };

  // Show system notification
  self.registration.showNotification(notificationTitle, notificationOptions);

  // Post message to client to show toast
  self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage({
        type: 'BACKGROUND_NOTIFICATION',
        title: notificationTitle,
        body: payload.notification.body
      });
    });
  });
});