'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700',
        className
      )}
    />
  );
}

function SkeletonText({ className, lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-700 p-6',
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

function SkeletonList({ count = 3, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonList };
