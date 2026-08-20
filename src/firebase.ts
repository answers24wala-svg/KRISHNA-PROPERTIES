import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCb7NQuxG_GuyrYOcqNu8V-oft8ebR0AZs",
  authDomain: "yeshaproject-7b979.firebaseapp.com",
  projectId: "yeshaproject-7b979",
  storageBucket: "yeshaproject-7b979.firebasestorage.app",
  messagingSenderId: "393330229952",
  appId: "1:393330229952:web:21256d0b3b541d4dc3e325",
  measurementId: "G-Y7NQ9Z0Y34"
};

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const firebaseAuth = getAuth(firebaseApp);
