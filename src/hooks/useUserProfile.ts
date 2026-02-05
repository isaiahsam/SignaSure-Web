'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/firebase/firestore';

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  hasAcceptedTerms?: boolean;
  termsAcceptedAt?: Date;
  hasCompletedTour?: boolean;
  tourCompletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      return getUserProfile(user.uid) as Promise<UserProfile | null>;
    },
    enabled: !!user?.uid,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['userProfile', user?.uid] });
  };

  return {
    profile,
    isLoading,
    isError,
    invalidate,
  };
}
