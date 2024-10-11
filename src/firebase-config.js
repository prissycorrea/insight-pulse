// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl822tuXxlm0MpOqNr1rGB6rniAZFByZY",
  authDomain: "insight-pulse.firebaseapp.com",
  projectId: "insight-pulse",
  storageBucket: "insight-pulse.appspot.com",
  messagingSenderId: "577617251411",
  appId: "1:577617251411:web:3cabc76e53577b02600aa6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exporta Firestore e Authentication
export const db = getFirestore(app);
export const auth = getAuth(app);