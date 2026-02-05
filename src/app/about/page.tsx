import Link from 'next/link';
import { Footer } from '@/components/layout/footer';
import {
  ArrowLeft,
  Upload,
  Brain,
  FileSearch,
  Shield,
  Zap,
  HelpCircle,
  Mail,
} from 'lucide-react';

export default function AboutPage() {
  const faqs = [
    {
      q: 'Is SignaSure a substitute for a lawyer?',
      a: 'No. SignaSure provides AI-powered analysis for informational purposes only. It does not constitute legal advice. Always consult a qualified attorney before signing any legal document.',
    },
    {
      q: 'What types of documents can I upload?',
      a: 'We support PDFs, images (JPG, PNG), and common document formats. This includes leases, employment contracts, NDAs, service agreements, loan documents, and more.',
    },
    {
      q: 'How is my data handled?',
      a: 'Your documents are processed securely and are not shared with third parties. We only retain basic usage data to improve the service. See our Privacy Policy for full details.',
    },
    {
      q: 'How many documents can I analyze per day?',
      a: 'Free accounts get 10 analyses per day. The limit resets at midnight.',
    },
    {
      q: 'How accurate is the AI analysis?',
      a: 'SignaSure uses advanced AI models to identify risks and summarize clauses. While it is highly capable, no AI is perfect — treat the output as a helpful starting point, not a definitive legal opinion.',
    },
    {
      q: 'Can I use SignaSure on my phone?',
      a: 'Yes. SignaSure is fully responsive and works on mobile browsers. Upload documents, view analyses, and manage your history from any device.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-extrabold font-brand text-primary-600">
              SIGNASURE
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            About <span className="text-primary-600">SignaSure</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Making legal documents understandable for everyone.
          </p>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-12 md:py-16 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Why SignaSure Exists
            </h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              Most people sign contracts they don&apos;t fully understand. Legal language is
              dense, intimidating, and designed for lawyers — not for the people whose lives
              the contracts actually affect.
            </p>
            <p>
              SignaSure was built by <strong className="text-slate-900 dark:text-slate-100">LoomaLabs</strong> to
              close that gap. We believe everyone deserves to understand what they&apos;re signing,
              whether it&apos;s a rental lease, an employment contract, or a freelance agreement.
            </p>
            <p>
              Our AI reads the fine print so you don&apos;t have to — flagging risks, explaining
              complex clauses in plain language, and giving you the confidence to ask the right
              questions before you sign.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              How It Works
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '1',
                icon: Upload,
                color: 'primary',
                title: 'Upload your document',
                desc: 'Drag and drop or select a PDF, image, or scanned document. Our OCR technology extracts the text automatically.',
              },
              {
                step: '2',
                icon: Brain,
                color: 'purple',
                title: 'AI analyzes every clause',
                desc: 'Our AI model reads the entire document, identifies the type of agreement, evaluates each clause for fairness, and flags anything that could be a risk to you.',
              },
              {
                step: '3',
                icon: FileSearch,
                color: 'green',
                title: 'Get a clear, actionable report',
                desc: 'Receive a risk score, plain-English summary, flagged concerns with severity levels, and specific recommendations — all in seconds.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 md:py-16 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <HelpCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
              >
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 mb-4">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Have Questions?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We&apos;d love to hear from you. Reach out to the LoomaLabs team for
            support, feedback, or partnership inquiries.
          </p>
          <a
            href="mailto:contact.loomalabs@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Mail className="h-4 w-4" />
            contact.loomalabs@gmail.com
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
