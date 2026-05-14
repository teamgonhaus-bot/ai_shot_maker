// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// IMPORTANT: Replace these with your actual Firebase project configuration
// You can find these in your Firebase Console: Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAPnhuDfNisaDTIipYbnWbaPlbf1E31VkY",
  authDomain: "ai-shot-maker.firebaseapp.com",
  projectId: "ai-shot-maker",
  storageBucket: "ai-shot-maker.firebasestorage.app",
  messagingSenderId: "107992712160",
  appId: "1:107992712160:web:9bddce5c697cf13394e185",
  measurementId: "G-0MB42ZMBS2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
