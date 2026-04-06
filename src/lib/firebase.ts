import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAvyaPi-pjEO91xVWXETqfZT2RTC0wtBME",
  authDomain: "monitoring-pztm-004-esp32.firebaseapp.com",
  databaseURL: "https://monitoring-pztm-004-esp32-default-rtdb.firebaseio.com",
  projectId: "monitoring-pztm-004-esp32",
  storageBucket: "monitoring-pztm-004-esp32.firebasestorage.app",
  messagingSenderId: "452296818626",
  appId: "1:452296818626:web:564274821ba8e370b6205b"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
