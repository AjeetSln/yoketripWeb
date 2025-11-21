// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBiIINTPeVPryjQlIt053HxvApqx4-kyYM',
  authDomain: 'yoketrip.firebaseapp.com',
  databaseURL: 'https://yoketrip-default-rtdb.firebaseio.com',
  projectId: 'yoketrip',
  storageBucket: 'yoketrip.firebasestorage.app',
  messagingSenderId: '590504992173',
  appId: '1:590504992173:web:41fbcb88aeef4c225b5524',
  measurementId: 'G-RBDW95JJ0V',
};

const app = initializeApp(firebaseConfig);

// Initialize messaging only if supported
let messaging;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

export { messaging, getToken, onMessage, isSupported };