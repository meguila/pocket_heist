import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCuKCubhnf4wwPJAurtrL5WTLRoz07oQuA",
  authDomain: "pocket-heist-jpb.firebaseapp.com",
  projectId: "pocket-heist-jpb",
  storageBucket: "pocket-heist-jpb.firebasestorage.app",
  messagingSenderId: "847112029394",
  appId: "1:847112029394:web:1e7d50a41a8659b1ea190b"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
