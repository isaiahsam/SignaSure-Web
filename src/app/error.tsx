'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Something went wrong
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-8">
          We encountered an unexpected error. Please try again, or return to the home page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
