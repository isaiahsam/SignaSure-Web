'use client';

import { cn, getSeverityColor, getSeverityBgColor } from '@/lib/utils';
import { Flag, FLAG_TYPE_LABELS, SEVERITY_LABELS, sortFlagsBySeverity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedText } from '@/components/ui/formatted-text';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

interface FlagsTabProps {
  flags: Flag[];
}

export function FlagsTab({ flags }: FlagsTabProps) {
  const sortedFlags = sortFlagsBySeverity(flags);

  if (flags.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 w-fit mx-auto mb-4">
            <Info className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No Issues Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Great news! No significant concerns were identified in this document.
          </p>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = flags.filter((f) => f.severity === 'critical').length;
  const highCount = flags.filter((f) => f.severity === 'high').length;
  const mediumCount = flags.filter((f) => f.severity === 'medium').length;
  const lowCount = flags.filter((f) => f.severity === 'low').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            {criticalCount} Critical
          </div>
        )}
        {highCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            {highCount} High
          </div>
        )}
        {mediumCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm">
            <Info className="h-4 w-4" />
            {mediumCount} Medium
          </div>
        )}
        {lowCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm">
            <Info className="h-4 w-4" />
            {lowCount} Low
          </div>
        )}
      </div>

      {/* Flags list */}
      <div className="space-y-3">
        {sortedFlags.map((flag) => (
          <FlagItem key={flag.id} flag={flag} />
        ))}
      </div>
    </div>
  );
}

function FlagItem({ flag }: { flag: Flag }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityIcon = () => {
    switch (flag.severity) {
      case 'critical':
      case 'high':
        return AlertTriangle;
      case 'medium':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const Icon = getSeverityIcon();

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-start gap-3 text-left"
        >
          <div className={cn('p-2 rounded-lg mt-0.5', getSeverityBgColor(flag.severity))}>
            <Icon className={cn('h-4 w-4', getSeverityColor(flag.severity))} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {flag.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      getSeverityBgColor(flag.severity),
                      getSeverityColor(flag.severity)
                    )}
                  >
                    {SEVERITY_LABELS[flag.severity]}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {FLAG_TYPE_LABELS[flag.type]}
                  </span>
                </div>
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
            <p className="text-sm text-slate-600 dark:text-slate-400 break-words">
              <FormattedText text={flag.description} />
            </p>

            {flag.originalText && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-l-4 border-slate-300 dark:border-slate-600 overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                  From the document:
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic break-words">
                  &ldquo;{flag.originalText}&rdquo;
                </p>
              </div>
            )}

            {flag.recommendation && (
              <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 overflow-hidden">
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
                  Recommendation:
                </p>
                <p className="text-sm text-primary-700 dark:text-primary-300 break-words">
                  <FormattedText text={flag.recommendation} />
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
