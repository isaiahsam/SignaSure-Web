'use client';

import { cn } from '@/lib/utils';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface RiskScoreCardProps {
  riskScore: number;
}

export function RiskScoreCard({ riskScore }: RiskScoreCardProps) {
  const getRiskColor = (score: number) => {
    if (score <= 2) return 'text-green-600';
    if (score <= 6) return 'text-orange-500';
    return 'text-red-600';
  };

  const getRiskBgColor = (score: number) => {
    if (score <= 2) return 'bg-green-100 dark:bg-green-900/30';
    if (score <= 6) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getRiskText = (score: number) => {
    if (score <= 2) return 'Low Risk';
    if (score <= 4) return 'Low-Medium Risk';
    if (score <= 6) return 'Medium Risk';
    if (score <= 8) return 'High Risk';
    return 'Critical Risk';
  };

  const getSigningRecommendation = (score: number) => {
    if (score <= 2) return { text: 'Ready to Sign', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' };
    if (score <= 6) return { text: 'Sign with Caution', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' };
    return { text: 'Do Not Sign - Consult Legal Counsel', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' };
  };

  const recommendation = getSigningRecommendation(riskScore);
  const RecommendationIcon = recommendation.icon;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Shield className={cn('h-5 w-5', getRiskColor(riskScore))} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Risk Assessment
        </h3>
      </div>

      {/* Signing Recommendation Banner */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border-2 p-4 mb-6',
          recommendation.color
        )}
      >
        <RecommendationIcon className="h-7 w-7 flex-shrink-0" />
        <span className="text-lg font-bold">{recommendation.text}</span>
      </div>

      {/* Risk Score Display */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-slate-700">
              <div
                className={cn(
                  'h-3 rounded-full transition-all duration-500',
                  riskScore <= 2
                    ? 'bg-green-500'
                    : riskScore <= 6
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                )}
                style={{ width: `${(riskScore / 10) * 100}%` }}
              />
            </div>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-sm font-semibold',
              getRiskBgColor(riskScore),
              getRiskColor(riskScore)
            )}
          >
            {getRiskText(riskScore)}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {riskScore.toFixed(1)}/10.0
        </p>
      </div>
    </div>
  );
}
