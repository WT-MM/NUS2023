import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import Config from 'react-native-config';

// Initialize Firebase
const s = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  databaseURL: Config.FIREBASE_DATABASE_URL,
  projectId: Config.FIREBASE_PROJECT_ID,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
  appId: Config.FIREBASE_APP_ID,
};

const firebaseConfig = {
  apiKey: "AIzaSyDssaFhH3XAoEx4FiJXgdcx5f-pPPk7LMk",
  authDomain: "thisorthatai.firebaseapp.com",
  projectId: "thisorthatai",
  storageBucket: "thisorthatai.appspot.com",
  messagingSenderId: "50288179732",
  appId: "1:50288179732:web:df4e6765a3199717420501",
  measurementId: "G-W3C4ZH0ZBK"
};


export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);