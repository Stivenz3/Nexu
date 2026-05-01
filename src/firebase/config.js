import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjFyLsiJzZSMHKTahuNNMKEnO4VnUKioY",
  authDomain: "nexu-156ce.firebaseapp.com",
  projectId: "nexu-156ce",
  storageBucket: "nexu-156ce.firebasestorage.app",
  messagingSenderId: "661629916502",
  appId: "1:661629916502:web:0ed25d517141c6030c72f7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
