import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBqjX_DLK6pjtqO1z4cGTdRn31nRxoSdtI",
  authDomain: "thenovember-81625.firebaseapp.com",
  projectId: "thenovember-81625",
  storageBucket: "thenovember-81625.firebasestorage.app",
  messagingSenderId: "144933344510",
  appId: "1:144933344510:web:e9e782befef61a75c701af"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);