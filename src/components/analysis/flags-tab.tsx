'use client';

import { useState } from 'react';
import {
  AnalysisFlag,
  FlagSeverity,
  getFlagPriorityScore,
  getFlagActionLabel,
  getFlagPriorityRank,
  getFlagTypeDisplayName,
} from '@/types';
import { cn } from '@/lib/utils';
import {
  Flag,
  Info,
  AlertTriangle,
  AlertCircle,
  Skull,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';

interface FlagsTabProps {
  flags: AnalysisFlag[];
}

export function FlagsTab({ flags }: FlagsTabProps) {
  // Sort flags by priority (highest first)
  const sortedFlags = [...flags].sort(
    (a, b) => getFlagPriorityScore(b) - getFlagPriorityScore(a)
  );

  // Count by priority
  const criticalCount = sortedFlags.filter((f) => getFlagPriorityScore(f) >= 100).length;
  const highCount = sortedFlags.filter(
    (f) => getFlagPriorityScore(f) >= 70 && getFlagPriorityScore(f) < 100
  ).length;
  const mediumCount = sortedFlags.filter(
    (f) => getFlagPriorityScore(f) >= 40 && getFlagPriorityScore(f) < 70
  ).length;
  const lowCount = sortedFlags.filter((f) => getFlagPriorityScore(f) < 40).length;

  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="h-20 w-20 text-green-500" />
        <h3 className="mt-4 text-2xl font-bold text-green-600">No Issues Found</h3>
        <p className="mt-2 text-gray-500 dark:text-slate-400">
          This document appears to be free of major concerns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-red-100 p-2 dark:bg-red-800/30">
            <Flag className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-800 dark:text-red-300">What are Flags?</h4>
            <p className="text-sm text-red-700 dark:text-red-400">
              Warning signs of problems in the contract
            </p>
            <div className="mt-3 rounded-lg bg-white p-3 dark:bg-slate-800">
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Flags are problems we found that could hurt you. They include hidden fees,
                unfair terms, and tricky clauses. The worst problems are marked as
                &quot;Critical&quot; (P1) and should be fixed first.
              </p>
            </div>
            <p className="mt-3 text-xs font-semibold text-red-700 dark:text-red-400">
              Sorted by priority - Most important first:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {criticalCount > 0 && (
                <span className="rounded border border-red-900 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
                  P1: {criticalCount}
                </span>
              )}
              {highCount > 0 && (
                <span className="rounded border border-red-600 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:border-red-500 dark:text-red-400">
                  P2: {highCount}
                </span>
              )}
              {mediumCount > 0 && (
                <span className="rounded border border-orange-500 bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600 dark:bg-orange-900/30 dark:border-orange-500 dark:text-orange-400">
                  P3: {mediumCount}
                </span>
              )}
              {lowCount > 0 && (
                <span className="rounded border border-blue-500 bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400">
                  P4: {lowCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flag List */}
      <div className="space-y-3">
        {sortedFlags.map((flag, index) => (
          <FlagCard key={index} flag={flag} />
        ))}
      </div>
    </div>
  );
}

function FlagCard({ flag }: { flag: AnalysisFlag }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const priorityScore = getFlagPriorityScore(flag);

  const getSeverityIcon = (severity: FlagSeverity) => {
    switch (severity) {
      case FlagSeverity.low:
        return Info;
      case FlagSeverity.medium:
        return AlertTriangle;
      case FlagSeverity.high:
        return AlertCircle;
      case FlagSeverity.critical:
        return Skull;
    }
  };

  const getSeverityColor = (severity: FlagSeverity) => {
    switch (severity) {
      case FlagSeverity.low:
        return 'text-blue-600';
      case FlagSeverity.medium:
        return 'text-orange-500';
      case FlagSeverity.high:
        return 'text-red-500';
      case FlagSeverity.critical:
        return 'text-red-800';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 100) return 'text-red-900 bg-red-100 border-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300';
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-600 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-400';
    return 'text-blue-600 bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400';
  };

  const SeverityIcon = getSeverityIcon(flag.severity);

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <SeverityIcon className={cn('mt-0.5 h-5 w-5', getSeverityColor(flag.severity))} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">{flag.title}</h4>
            <span
              className={cn(
                'flex-shrink-0 rounded border px-2 py-0.5 text-xs font-bold',
                getPriorityColor(priorityScore)
              )}
            >
              {getFlagPriorityRank(priorityScore)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {getFlagTypeDisplayName(flag.type)}
          </p>
          <span
            className={cn(
              'mt-2 inline-block rounded px-2 py-0.5 text-xs font-semibold',
              getPriorityColor(priorityScore)
            )}
          >
            {getFlagActionLabel(priorityScore)}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 dark:border-slate-700">
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">Description:</h5>
              <p className="mt-1 text-gray-600 dark:text-slate-300">{flag.description}</p>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                Highlighted Text:
              </h5>
              <div className="mt-1 rounded-lg border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-600 dark:bg-yellow-900/20">
                <p className="italic text-gray-700 dark:text-slate-300">
                  {flag.highlightedText}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
