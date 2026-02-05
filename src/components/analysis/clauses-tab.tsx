'use client';

import { cn, getImportanceColor, getImportanceBgColor } from '@/lib/utils';
import { Clause, sortClausesByImportance } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedText } from '@/components/ui/formatted-text';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ClausesTabProps {
  clauses: Clause[];
  scrollToClauseId?: string | null;
}

export function ClausesTab({ clauses, scrollToClauseId }: ClausesTabProps) {
  const sortedClauses = sortClausesByImportance(clauses);

  // Scroll to specific clause when scrollToClauseId changes
  useEffect(() => {
    if (scrollToClauseId) {
      const element = document.getElementById(scrollToClauseId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToClauseId]);

  if (clauses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-fit mx-auto mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No Clauses Extracted
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No important clauses were identified in this document.
          </p>
        </CardContent>
      </Card>
    );
  }

  const highCount = clauses.filter((c) => c.importance === 'high').length;
  const mediumCount = clauses.filter((c) => c.importance === 'medium').length;
  const lowCount = clauses.filter((c) => c.importance === 'low').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        {highCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm">
            {highCount} High Importance
          </div>
        )}
        {mediumCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
            {mediumCount} Medium Importance
          </div>
        )}
        {lowCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">
            {lowCount} Low Importance
          </div>
        )}
      </div>

      {/* Clauses list */}
      <div className="space-y-3">
        {sortedClauses.map((clause) => (
          <ClauseItem
            key={clause.id}
            clause={clause}
            isTargeted={scrollToClauseId === clause.id}
          />
        ))}
      </div>
    </div>
  );
}

function ClauseItem({ clause, isTargeted }: { clause: Clause; isTargeted?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand when this clause is targeted
  useEffect(() => {
    if (isTargeted) {
      setIsExpanded(true);
    }
  }, [isTargeted]);

  const importanceLabels = {
    high: 'High Importance',
    medium: 'Medium Importance',
    low: 'Low Importance',
  };

  return (
    <Card
      id={clause.id}
      className={cn(
        isTargeted && 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900'
      )}
    >
      <CardHeader className="p-4 pb-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-start gap-3 text-left"
        >
          <div className={cn('p-2 rounded-lg mt-0.5', getImportanceBgColor(clause.importance))}>
            <FileText className={cn('h-4 w-4', getImportanceColor(clause.importance))} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {clause.title}
                </h4>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block',
                    getImportanceBgColor(clause.importance),
                    getImportanceColor(clause.importance)
                  )}
                >
                  {importanceLabels[clause.importance]}
                </span>
              </div>

              <div className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>
          </div>
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 pt-3 overflow-hidden">
          <div className="ml-11 space-y-3 overflow-hidden">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
                What this means in simple terms:
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
                <FormattedText text={clause.simplifiedExplanation} />
              </p>
            </div>

            {clause.originalText && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-l-4 border-slate-300 dark:border-slate-600 overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                  Original text:
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic break-words">
                  &ldquo;{clause.originalText}&rdquo;
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
