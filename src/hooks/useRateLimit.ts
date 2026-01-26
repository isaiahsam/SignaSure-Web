'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsageData, incrementUsage } from '@/lib/firebase/firestore';
import { useAuth } from './useAuth';

const DAILY_LIMIT = 10;

export function useRateLimit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: usage, isLoading, isError } = useQuery({
    queryKey: ['usage', user?.uid],
    queryFn: () => {
      if (!user) return null;
      return getUsageData(user.uid);
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
    retry: 1, // Only retry once
    retryDelay: 1000,
  });

  const incrementMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not authenticated');
      return incrementUsage(user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage', user?.uid] });
    },
  });

  const currentCount = usage?.analysisCount || 0;
  const remainingAnalyses = Math.max(0, DAILY_LIMIT - currentCount);
  // Always allow analysis if Firestore fails (isError) or still loading
  const canAnalyze = isError || isLoading || remainingAnalyses > 0;

  return {
    currentCount,
    remainingAnalyses,
    dailyLimit: DAILY_LIMIT,
    canAnalyze,
    isLoading,
    isError,
    incrementUsage: incrementMutation.mutateAsync,
  };
}
