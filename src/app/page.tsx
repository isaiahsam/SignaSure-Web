'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks';
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';
import { GoogleSignInButton } from '@/components/auth';
import { Button } from '@/components/ui';
import {
  FileText,
  Shield,
  Zap,
  Eye,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const features = [
    {
      icon: Shield,
      title: 'Risk Assessment',
      description: 'Get a clear risk score and signing recommendation for any legal document.',
    },
    {
      icon: Eye,
      title: 'Hidden Fee Detection',
      description: 'AI identifies hidden fees, penalties, and unfavorable terms you might miss.',
    },
    {
      icon: Zap,
      title: 'Plain English',
      description: 'Complex legal jargon translated into simple terms anyone can understand.',
    },
    {
      icon: CheckCircle,
      title: 'Action Items',
      description: 'Prioritized list of issues with specific recommendations for each.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 animate-fade-in-down">
              <FileText className="h-4 w-4" />
              AI-Powered Document Analysis
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Understand Any Legal Document
              <br />
              <span className="text-primary-600">Before You Sign</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-slate-300 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Upload contracts, leases, or agreements and get instant AI analysis.
              Identify hidden fees, unfavorable terms, and potential risks in plain English.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 group">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <div className="w-full max-w-xs">
                  <GoogleSignInButton />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white animate-fade-in">
            How SignaSure Helps You
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-700 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index + 0.4}s`, animationFillMode: 'forwards' }}
              >
                <div className="inline-flex rounded-lg bg-primary-100 p-3 dark:bg-primary-900/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gray-50 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
              How It Works
            </h2>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Upload Your Document',
                  description: 'Drag and drop a PDF or image of your legal document.',
                },
                {
                  step: '2',
                  title: 'AI Analysis',
                  description: 'Our AI extracts text and analyzes it for potential issues.',
                },
                {
                  step: '3',
                  title: 'Review Results',
                  description: 'Get a clear risk score, flagged issues, and recommendations.',
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="text-center group opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${0.2 * index}s`, animationFillMode: 'forwards' }}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-500/30">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary-600 px-6 py-12 text-center sm:px-12 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20">
            <h2 className="text-3xl font-bold text-white">
              Ready to Understand Your Documents?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
              Sign in with Google to get started. Free to use with rate limits.
            </p>
            <div className="mt-8 flex justify-center">
              {isAuthenticated ? (
                <Link href="/upload">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-primary-600 hover:bg-gray-100 group"
                  >
                    Upload a Document
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <div className="w-full max-w-xs">
                  <GoogleSignInButton />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
