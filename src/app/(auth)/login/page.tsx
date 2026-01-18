'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { GoogleSignInButton } from '@/components/auth';
import { FileText } from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <FileText className="h-10 w-10 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                SignaSure
              </span>
            </Link>

            <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-gray-600 dark:text-slate-300">
              Sign in to analyze your legal documents
            </p>
          </div>

          <div className="mt-8">
            <GoogleSignInButton />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
          <Link href="/" className="text-primary-600 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
