import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyArduLnOejlL0vxRj45Qrhzim7hzFi157o",
  authDomain: "november-menswear.firebaseapp.com",
  projectId: "november-menswear",
  storageBucket: "november-menswear.firebasestorage.app",
  messagingSenderId: "317365884171",
  appId: "1:317365884171:web:b339f30f2609a6134cbe0e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);