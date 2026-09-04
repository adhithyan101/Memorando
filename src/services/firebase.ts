import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence, 
  setPersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDdQluiqdaevo2sGqTSx6F53Q6SNlJLi4I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "memorando-edc1a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "memorando-edc1a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "memorando-edc1a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "268353897227",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:268353897227:web:0b156094f9ba3cf7d2580e"
};

// Initialize Firebase app singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Enable local persistence for auth state
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase auth persistence configuration warning:', err);
});

export default app;
