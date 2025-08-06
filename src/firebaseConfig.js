// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYS79hYHzeOa31KmSQ219utdNND48wTqs",
  authDomain: "bolobharat-1e5c4.firebaseapp.com",
  projectId: "bolobharat-1e5c4",
  storageBucket: "bolobharat-1e5c4.appspot.com",
  messagingSenderId: "240679571953",
  appId: "1:240679571953:web:28bc10e2f5c7863d73b450",
  measurementId: "G-QT8Q71YPM7",
  databaseURL: "https://bolobharat-1e5c4-default-rtdb.firebaseio.com"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Initialize Analytics
export const auth = getAuth(app); // Export Auth instance
export const db = getDatabase(app); // Export Realtime Database instance