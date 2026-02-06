import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAAODzPnFsXIsQTxOokyn72RvMupV7TUZg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sam-universe.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sam-universe",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sam-universe.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "293278525585",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:293278525585:web:a886cc625bc3f4ea4b3730"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

export default app
