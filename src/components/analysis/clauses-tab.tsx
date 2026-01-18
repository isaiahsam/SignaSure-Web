'use client';

import { useState } from 'react';
import { ImportantClause, ClauseImportance } from '@/types';
import { cn } from '@/lib/utils';
import { FileText, ChevronDown, ChevronUp, Gavel } from 'lucide-react';

interface ClausesTabProps {
  clauses: ImportantClause[];
}

export function ClausesTab({ clauses }: ClausesTabProps) {
  // Sort clauses by importance (critical first)
  const sortedClauses = [...clauses].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.importance] - order[b.importance];
  });

  if (clauses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Gavel className="h-20 w-20 text-gray-400" />
        <h3 className="mt-4 text-xl font-bold text-gray-500">No Key Clauses Identified</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-800/30">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-800 dark:text-blue-300">
              What are Important Clauses?
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Key parts you should understand
            </p>
            <div className="mt-3 rounded-lg bg-white p-3 dark:bg-slate-800">
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Clauses are important rules in the contract written in plain English. We
                explain what each rule means so you can understand what you&apos;re
                agreeing to without legal jargon.
              </p>
            </div>
            <p className="mt-3 text-xs font-semibold text-blue-700 dark:text-blue-400">
              Sorted by importance - Most important first
            </p>
          </div>
        </div>
      </div>

      {/* Clause List */}
      <div className="space-y-3">
        {sortedClauses.map((clause, index) => (
          <ClauseCard key={index} clause={clause} />
        ))}
      </div>
    </div>
  );
}

function ClauseCard({ clause }: { clause: ImportantClause }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getImportanceColor = (importance: ClauseImportance) => {
    switch (importance) {
      case ClauseImportance.low:
        return 'bg-green-500';
      case ClauseImportance.medium:
        return 'bg-orange-500';
      case ClauseImportance.high:
        return 'bg-red-500';
      case ClauseImportance.critical:
        return 'bg-red-800';
    }
  };

  const getImportanceTextColor = (importance: ClauseImportance) => {
    switch (importance) {
      case ClauseImportance.low:
        return 'text-green-600 dark:text-green-400';
      case ClauseImportance.medium:
        return 'text-orange-600 dark:text-orange-400';
      case ClauseImportance.high:
        return 'text-red-600 dark:text-red-400';
      case ClauseImportance.critical:
        return 'text-red-800 dark:text-red-300';
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div
          className={cn('mt-1 h-10 w-2 rounded-full', getImportanceColor(clause.importance))}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white">{clause.title}</h4>
          <p className={cn('mt-1 text-sm', getImportanceTextColor(clause.importance))}>
            Importance: {clause.importance.toUpperCase()}
          </p>
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
              <h5 className="font-semibold text-gray-900 dark:text-white">
                Plain English Explanation:
              </h5>
              <div className="mt-1 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20">
                <p className="text-gray-700 dark:text-slate-300">
                  {clause.simplifiedExplanation}
                </p>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                Original Legal Text:
              </h5>
              <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-600 dark:bg-slate-700">
                <p className="text-sm italic text-gray-600 dark:text-slate-400">
                  {clause.originalText}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
