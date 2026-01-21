'use client';

import { cn, getRiskColor, getRiskBgColor, getRiskLabel } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskScoreCardProps {
  score: number;
  className?: string;
}

export function RiskScoreCard({ score, className }: RiskScoreCardProps) {
  const getIcon = () => {
    if (score <= 30) return CheckCircle;
    if (score <= 60) return Shield;
    return AlertTriangle;
  };

  const Icon = getIcon();

  // Calculate the stroke dash offset for the circular progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getStrokeColor = () => {
    if (score <= 30) return '#22c55e'; // green-500
    if (score <= 60) return '#eab308'; // yellow-500
    if (score <= 80) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-200 dark:text-slate-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getStrokeColor()}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('text-3xl font-bold', getRiskColor(score))}>
                {score}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('p-2 rounded-lg', getRiskBgColor(score))}>
                <Icon className={cn('h-5 w-5', getRiskColor(score))} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Risk Score
              </h3>
            </div>
            <p className={cn('text-xl font-medium mb-2', getRiskColor(score))}>
              {getRiskLabel(score)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {score <= 30 && 'This document appears to be generally safe with few concerns.'}
              {score > 30 && score <= 60 && 'This document has some areas that need attention.'}
              {score > 60 && score <= 80 && 'This document has significant concerns to address.'}
              {score > 80 && 'This document requires careful review before signing.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
