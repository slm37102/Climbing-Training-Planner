import { vi } from 'vitest';

// Mock Firebase Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null);
    return () => {};
  },
};

export const signInWithEmailAndPassword = vi.fn();
export const createUserWithEmailAndPassword = vi.fn();
export const signInWithPopup = vi.fn();
export const signOut = vi.fn();
export const onAuthStateChanged = vi.fn((auth, callback) => {
  callback(null);
  return () => {};
});
export const GoogleAuthProvider = vi.fn();

// Mock Firebase Firestore
export const db = {};
export const getFirestore = vi.fn(() => db);
export const collection = vi.fn();
export const doc = vi.fn();
export const getDoc = vi.fn();
export const setDoc = vi.fn();
export const updateDoc = vi.fn();
export const deleteDoc = vi.fn();
export const onSnapshot = vi.fn();

// Mock Firebase App
export const initializeApp = vi.fn(() => ({}));
export const getAuth = vi.fn(() => auth);
