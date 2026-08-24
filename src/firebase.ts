/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfigJson from '../firebase-applet-config.json';

const env = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId || '(default)',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const databaseId =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : '(default)';

export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
};
export type { FirebaseUser };

/**
 * Test the active Firestore connection
 */
export async function testFirestoreConnection(): Promise<{
  success: boolean;
  message: string;
  projectId: string;
  databaseId: string;
}> {
  try {
    const configDocRef = doc(db, 'gym_config', 'main');
    const snapshot = await getDoc(configDocRef);
    return {
      success: true,
      message: snapshot.exists()
        ? 'Connected to Firestore. Live configuration document verified.'
        : 'Connected to Firestore. Schema is ready for initial document creation.',
      projectId: firebaseConfig.projectId,
      databaseId,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to connect to Firestore backend.',
      projectId: firebaseConfig.projectId,
      databaseId,
    };
  }
}

