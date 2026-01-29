'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Zap, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  const features = [
    { icon: Shield, text: 'Identify risks instantly' },
    { icon: Zap, text: 'AI-powered analysis' },
    { icon: CheckCircle, text: '10 free analyses daily' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="lg:flex-1 bg-primary-600 p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto lg:mx-0">
          <Link href="/" className="flex items-center mb-8">
            <span className="text-3xl font-extrabold font-brand text-white">SIGNASURE</span>
          </Link>

          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Understand your contracts before you sign
          </h1>

          <p className="text-primary-100 text-lg mb-8">
            Upload any legal document and get instant AI-powered analysis with
            plain English explanations.
          </p>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-white/20">
                  <feature.icon className="h-5 w-5" />
                </div>
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to continue to SignaSure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <GoogleSignInButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">
                  Secure authentication
                </span>
              </div>
            </div>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-primary-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
