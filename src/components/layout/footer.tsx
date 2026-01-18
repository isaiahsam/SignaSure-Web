'use client';

import { FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600" />
            <span className="font-semibold text-gray-900 dark:text-white">SignaSure</span>
          </div>

          <p className="text-sm text-gray-500 dark:text-slate-400">
            AI-powered legal document analysis. Not a substitute for legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
