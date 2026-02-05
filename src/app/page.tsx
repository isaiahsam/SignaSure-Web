'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PenLoader } from '@/components/ui/pen-loader';
import { Footer } from '@/components/layout/footer';
import {
  FileText,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Upload,
  Brain,
  FileSearch,
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <PenLoader />;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-extrabold font-brand text-primary-600">
              SIGNASURE
            </span>
          </Link>

          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              AI-Powered Document Analysis
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Understand Your Contracts{' '}
              <span className="text-primary-600">in Plain English</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Upload any legal document and get instant AI analysis. Identify risks,
              understand complex clauses, and make informed decisions before you sign.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Start Analyzing Free
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              10 free analyses per day. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get document insights in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-4 rounded-xl bg-primary-100 dark:bg-primary-900/30 w-fit mb-6">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                1. Upload Your Document
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Upload a PDF or image of your contract. We support leases, employment
                contracts, NDAs, and more.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit mb-6">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                2. AI Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Our AI reads and analyzes every clause, identifying risks, obligations,
                and important terms.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/30 w-fit mb-6">
                <FileSearch className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                3. Get Clear Insights
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Receive a detailed report with risk scores, plain English explanations,
                and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Why Choose SignaSure
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Powerful features designed for everyone
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Risk Identification',
                description:
                  'Automatically detect potential risks, unfair clauses, and hidden obligations.',
              },
              {
                icon: FileText,
                title: 'Plain English',
                description:
                  'Complex legal jargon translated into simple language anyone can understand.',
              },
              {
                icon: Zap,
                title: 'Instant Analysis',
                description:
                  'Get comprehensive document analysis in seconds, not hours or days.',
              },
              {
                icon: CheckCircle,
                title: 'Actionable Advice',
                description:
                  'Receive specific recommendations on what to negotiate or watch out for.',
              },
              {
                icon: FileSearch,
                title: 'Multiple Formats',
                description:
                  'Support for PDFs, images, and scanned documents with OCR technology.',
              },
              {
                icon: Shield,
                title: 'Privacy First',
                description:
                  'Your documents are processed securely and never stored permanently.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30 h-fit">
                  <feature.icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 bg-primary-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Understand Your Documents?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of users who make smarter decisions with SignaSure.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              variant="secondary"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
