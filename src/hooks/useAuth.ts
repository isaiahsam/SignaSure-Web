'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const {
    user,
    loading,
    initialized,
    error,
    signInWithGoogle,
    signOut,
    initializeAuth,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
  };
}
