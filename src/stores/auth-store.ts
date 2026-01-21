'use client';

import { create } from 'zustand';
import type { User } from 'firebase/auth';
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  onAuthChange,
} from '@/lib/firebase/auth';
import { createUserProfile } from '@/lib/firebase/firestore';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  setError: (error) => set({ error }),

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const user = await firebaseSignInWithGoogle();
      if (user) {
        await createUserProfile(user.uid, {
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
        });
        set({ user, loading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      set({ error: message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseSignOut();
      set({ user: null, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      set({ error: message, loading: false });
      throw error;
    }
  },

  initializeAuth: () => {
    const unsubscribe = onAuthChange((user) => {
      set({ user, loading: false, initialized: true });
    });
    return unsubscribe;
  },
}));
