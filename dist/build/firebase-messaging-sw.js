// /public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');
import logo from './asstes/safar-sathi2.png';

const firebaseConfig = {
  apiKey: "AIzaSyBiIINTPeVPryjQlIt053HxvApqx4-kyYM",
  authDomain: "yoketrip.firebaseapp.com",
  databaseURL: "https://yoketrip-default-rtdb.firebaseio.com",
  projectId: "yoketrip",
  storageBucket: "yoketrip.firebasestorage.app",
  messagingSenderId: "590504992173",
  appId: "1:590504992173:web:41fbcb88aeef4c225b5524",
  measurementId: "G-RBDW95JJ0V"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: {logo} // Make sure this path is correct
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});