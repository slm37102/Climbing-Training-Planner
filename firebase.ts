import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD-QoVCAE-t3Oz9melxta-oVNTdhiQfKmU",
  authDomain: "climbing-training-planner.firebaseapp.com",
  projectId: "climbing-training-planner",
  storageBucket: "climbing-training-planner.firebasestorage.app",
  messagingSenderId: "367892466710",
  appId: "1:367892466710:web:bba7876e92591a1e9f7937",
  measurementId: "G-XH7W90R60T"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
