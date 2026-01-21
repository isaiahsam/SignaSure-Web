import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    console.warn('Firebase auth not initialized');
    // Still call the callback with null to update the state
    setTimeout(() => callback(null), 0);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  if (!auth) {
    return null;
  }
  return auth.currentUser;
}
