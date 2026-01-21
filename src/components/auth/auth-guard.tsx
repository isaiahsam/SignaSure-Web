'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export function AuthGuard({ children, fallbackUrl = '/login' }: AuthGuardProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push(fallbackUrl);
    }
  }, [user, loading, initialized, router, fallbackUrl]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
