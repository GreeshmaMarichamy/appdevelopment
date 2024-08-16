// firebasec.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAD6jrC0OTMMy024_SN4gCXAYy0Dkp_ghY",
    authDomain: "answerhub-auth-3b821.firebaseapp.com",
    projectId: "answerhub-auth-3b821",
    storageBucket: "answerhub-auth-3b821.appspot.com",
    messagingSenderId: "40884446957",
    appId: "1:40884446957:web:82dd05575280ceee150ee4",
    measurementId: "G-6D96717CDD"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth, ref, push };
