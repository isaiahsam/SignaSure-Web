'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, FileText, CheckCircle, XCircle } from 'lucide-react';

interface TermsAgreementModalProps {
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
}

export function TermsAgreementModal({ onAccept, onDecline }: TermsAgreementModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await onDecline();
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-page-enter">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
            Terms of Service
          </h2>
          <p className="text-primary-100 text-xs sm:text-sm mt-1">
            Please review and accept our terms to continue
          </p>
        </div>

        {/* Content — scrollable */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-3 overflow-y-auto flex-1 min-h-0">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            By using SignaSure, you agree to the following:
          </p>

          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                SignaSure provides AI-powered analysis for informational purposes only and does not constitute legal advice.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                Your uploaded documents are processed securely and are not shared with third parties.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                You are responsible for verifying any analysis results with a qualified legal professional.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                We collect basic usage data to improve the service, as described in our Privacy Policy.
              </span>
            </li>
          </ul>

          <div className="flex gap-3 pt-1">
            <Link
              href="/terms"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <FileText className="h-3.5 w-3.5" />
              Full Terms
            </Link>
            <Link
              href="/privacy"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <Shield className="h-3.5 w-3.5" />
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isAccepting || isDeclining}
            leftIcon={<XCircle className="h-4 w-4" />}
          >
            {isDeclining ? 'Signing out...' : 'Decline & Sign Out'}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isAccepting || isDeclining}
            leftIcon={<CheckCircle className="h-4 w-4" />}
          >
            {isAccepting ? 'Accepting...' : 'I Accept'}
          </Button>
        </div>
      </div>
    </div>
  );
}
