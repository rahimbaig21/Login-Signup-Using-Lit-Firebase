// firebaseInit.js (or firebaseInit.ts if you're using TypeScript)
import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDk3J2ClOCnYElk3zCN4SNxUc1oXQ2VzyI",
  authDomain: "login-signup-88bbc.firebaseapp.com",
  projectId: "login-signup-88bbc",
  storageBucket: "login-signup-88bbc.firebasestorage.app",
  messagingSenderId: "942672358829",
  appId: "1:942672358829:web:f8857c60c39653552f8524",
  measurementId: "G-HDENGD2BBC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

export { functions ,app};  
