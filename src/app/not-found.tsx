import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
          <FileQuestion className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>

        <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          404
        </h1>

        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Page Not Found
        </h2>

        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button leftIcon={<Home className="w-4 h-4" />}>
              Go Home
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
