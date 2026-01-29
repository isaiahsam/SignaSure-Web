'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="text-2xl font-extrabold font-brand text-primary-600">
                SIGNASURE
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              AI-powered legal document analysis that helps you understand contracts,
              identify risks, and make informed decisions.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Upload Document
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Document History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {currentYear} LoomaLabs. All rights reserved.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center md:text-right max-w-md">
              Disclaimer: SignaSure provides AI-powered analysis for informational purposes
              only. It is not a substitute for professional legal advice. Always consult
              with a qualified attorney for legal matters.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
