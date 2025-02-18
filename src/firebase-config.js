import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCoPZ3_Ktah8UBBSgh0_OXL5SQwUtL6Wok",
  authDomain: "menumitra-83831.firebaseapp.com",
  projectId: "menumitra-83831",
  storageBucket: "menumitra-83831.appspot.com",
  messagingSenderId: "851450497367",
  appId: "1:851450497367:web:e2347945f3decce56a9612",
  measurementId: "G-Q6V5R4EDYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Check if running in Electron
const isElectron = window && window.process && window.process.type;

// Initialize messaging only in web environment
let messagingInstance = null;
let fcmToken = null;

if (!isElectron && 'serviceWorker' in navigator) {
  try {
    messagingInstance = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging initialization failed:', error);
  }
}

const initializeMessaging = async () => {
  try {
    if (!isElectron && messagingInstance) {
      // Web browser environment
      fcmToken = await getToken(messagingInstance, {
        vapidKey: "BGsWfw7acs_yXMa_bcWfw-49_MQkV8MdSOrCih9OO-v9pQ7AvKA2niL1dvguaHMfObKP8tO7Bq_4aTVEwOyA8x4"
      });
    } else {
      // Electron environment
      fcmToken = localStorage.getItem('fcm_token') || 
                 'electron_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('fcm_token', fcmToken);
    }
    return fcmToken;
  } catch (error) {
    console.warn('Firebase messaging initialization failed:', error);
    // Fallback token for both environments
    fcmToken = localStorage.getItem('fcm_token') || 
               'electron_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('fcm_token', fcmToken);
    return fcmToken;
  }
};

// Function to get FCM token safely
export const getFCMToken = async () => {
  if (!fcmToken) {
    return initializeMessaging();
  }
  return fcmToken;
};

// Function to show notification based on environment
const showNotification = (title, body) => {
  const isElectron = window && window.process && window.process.type;

  // Show toast notification
  if (window.showToast) {
    window.showToast('notification', `${title}: ${body}`);
  }

  // Also show system notification
  if (isElectron) {
    // Send to electron main process
    window.ipcRenderer?.send('show-notification', { title, body });
  } else {
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
};

// Function to handle incoming messages safely
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!isElectron && messagingInstance) {
      onMessage(messagingInstance, (payload) => {
        // Show notification regardless of environment
        if (payload?.notification) {
          showNotification(
            payload.notification.title,
            payload.notification.body
          );
          
          // Also show toast for background messages
          if (payload.messageType === 'background') {
            window.showToast?.('notification', 
              `${payload.notification.title}: ${payload.notification.body}`
            );
          }
        }
        resolve(payload);
      });
    } else {
      // For Electron, we'll handle notifications through a different channel
      resolve(null);
    }
  });

// Export messaging instance only if not in Electron
export { app, messagingInstance as messaging, showNotification }; 