'use client';

import { User, Shield, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Verdict, VERDICT_LABELS } from '@/types';

interface RoleCardProps {
  role: string;
  verdict?: Verdict;
  className?: string;
}

const VERDICT_ICONS: Record<Verdict, typeof CheckCircle> = {
  safe_to_sign: CheckCircle,
  review_carefully: AlertCircle,
  negotiate_before_signing: AlertTriangle,
  high_risk_legal_review: Shield,
};

const VERDICT_CARD_STYLES: Record<Verdict, { bg: string; border: string; badge: string }> = {
  safe_to_sign: {
    bg: 'from-green-500 to-green-600',
    border: 'border-green-400/30',
    badge: 'bg-white/20 text-white border-white/30',
  },
  review_carefully: {
    bg: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-400/30',
    badge: 'bg-white/20 text-white border-white/30',
  },
  negotiate_before_signing: {
    bg: 'from-orange-500 to-orange-600',
    border: 'border-orange-400/30',
    badge: 'bg-white/20 text-white border-white/30',
  },
  high_risk_legal_review: {
    bg: 'from-red-500 to-red-600',
    border: 'border-red-400/30',
    badge: 'bg-white/20 text-white border-white/30',
  },
};

export function RoleCard({ role, verdict, className }: RoleCardProps) {
  const styles = verdict
    ? VERDICT_CARD_STYLES[verdict]
    : { bg: 'from-primary-500 to-primary-600', border: 'border-primary-400/30', badge: '' };

  const VerdictIcon = verdict ? VERDICT_ICONS[verdict] : null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border shadow-lg',
        `bg-gradient-to-r ${styles.bg} ${styles.border}`,
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-32 -translate-y-32">
          <User className="w-full h-full text-white" />
        </div>
      </div>

      <div className="relative p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Role Information */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80 uppercase tracking-wide">
                Your Role in This Document
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                You are the {role}
              </p>
            </div>
          </div>

          {/* Right: Verdict Badge */}
          {verdict && (
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg border backdrop-blur-sm',
                styles.badge
              )}
            >
              {VerdictIcon && <VerdictIcon className="h-5 w-5" />}
              <span className="font-semibold whitespace-nowrap">
                {VERDICT_LABELS[verdict]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
