'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { getUsageTimestamps, recordUsage } from '@/lib/firebase';
import { RateLimitStatus, UsageStats } from '@/types';

const MAX_PER_HOUR = 5;
const MAX_PER_DAY = 20;

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function calculateRateLimitStatus(timestamps: Date[]): RateLimitStatus {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Filter timestamps
  const lastHour = timestamps.filter((ts) => ts > oneHourAgo);
  const lastDay = timestamps.filter((ts) => ts > oneDayAgo);

  // Check hourly limit
  if (lastHour.length >= MAX_PER_HOUR) {
    const oldestInHour = lastHour.reduce((a, b) => (a < b ? a : b));
    const resetTime = new Date(oldestInHour.getTime() + 60 * 60 * 1000);
    const timeUntilReset = resetTime.getTime() - now.getTime();

    return {
      canProceed: false,
      remaining: 0,
      resetTime,
      limitType: 'hourly',
      message: `Hourly limit reached (${MAX_PER_HOUR} per hour). Next analysis available in ${formatDuration(timeUntilReset)}.`,
      hourlyResetTime: resetTime,
      dailyResetTime: lastDay.length > 0
        ? new Date(lastDay.reduce((a, b) => (a < b ? a : b)).getTime() + 24 * 60 * 60 * 1000)
        : undefined,
    };
  }

  // Check daily limit
  if (lastDay.length >= MAX_PER_DAY) {
    const oldestInDay = lastDay.reduce((a, b) => (a < b ? a : b));
    const resetTime = new Date(oldestInDay.getTime() + 24 * 60 * 60 * 1000);
    const timeUntilReset = resetTime.getTime() - now.getTime();

    return {
      canProceed: false,
      remaining: 0,
      resetTime,
      limitType: 'daily',
      message: `Daily limit reached (${MAX_PER_DAY} per day). Next analysis available in ${formatDuration(timeUntilReset)}.`,
      hourlyResetTime: lastHour.length > 0
        ? new Date(lastHour.reduce((a, b) => (a < b ? a : b)).getTime() + 60 * 60 * 1000)
        : undefined,
      dailyResetTime: resetTime,
    };
  }

  // Calculate remaining
  const remainingHourly = MAX_PER_HOUR - lastHour.length;
  const remainingDaily = MAX_PER_DAY - lastDay.length;
  const remaining = Math.min(remainingHourly, remainingDaily);

  // Calculate reset times
  const hourlyResetTime =
    lastHour.length > 0
      ? new Date(lastHour.reduce((a, b) => (a < b ? a : b)).getTime() + 60 * 60 * 1000)
      : new Date(now.getTime() + 60 * 60 * 1000);

  const dailyResetTime =
    lastDay.length > 0
      ? new Date(lastDay.reduce((a, b) => (a < b ? a : b)).getTime() + 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    canProceed: true,
    remaining,
    resetTime: hourlyResetTime,
    limitType: 'available',
    message: `You have ${remainingHourly} analyses left this hour, ${remainingDaily} left today.`,
    hourlyResetTime,
    dailyResetTime,
  };
}

function calculateUsageStats(timestamps: Date[]): UsageStats {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const usedThisHour = timestamps.filter((ts) => ts > oneHourAgo).length;
  const usedToday = timestamps.filter((ts) => ts > oneDayAgo).length;

  return {
    usedThisHour,
    usedToday,
    remainingThisHour: MAX_PER_HOUR - usedThisHour,
    remainingToday: MAX_PER_DAY - usedToday,
    maxPerHour: MAX_PER_HOUR,
    maxPerDay: MAX_PER_DAY,
  };
}

export function useRateLimit() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const timestampsQuery = useQuery({
    queryKey: ['usage', user?.uid],
    queryFn: () => (user ? getUsageTimestamps(user.uid) : Promise.resolve([])),
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });

  const recordUsageMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return recordUsage(user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage'] });
    },
  });

  const timestamps = timestampsQuery.data || [];
  const status = calculateRateLimitStatus(timestamps);
  const stats = calculateUsageStats(timestamps);

  return {
    status,
    stats,
    isLoading: timestampsQuery.isLoading,
    recordUsage: recordUsageMutation.mutateAsync,
    refetch: timestampsQuery.refetch,
  };
}
