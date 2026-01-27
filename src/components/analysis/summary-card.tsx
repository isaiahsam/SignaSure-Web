'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedText } from '@/components/ui/formatted-text';
import { FileText, Lightbulb, Scale, CheckCircle, User, HelpCircle, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Clause, type Verdict, VERDICT_LABELS, VERDICT_COLORS } from '@/types';

interface SummaryCardProps {
  summary: string;
  recommendations: string[];
  fairnessAssessment: string;
  // New props for enhanced display
  assumedUserRole?: string;
  verdict?: Verdict;
  clarifyChecklist?: string[];
  philippinesNotes?: string[];
  disclaimer?: string;
  clauses?: Clause[];
  onClauseClick?: (clauseId: string) => void;
}

export function SummaryCard({
  summary,
  recommendations,
  fairnessAssessment,
  assumedUserRole,
  verdict,
  clarifyChecklist,
  philippinesNotes,
  disclaimer,
  clauses,
  onClauseClick,
}: SummaryCardProps) {
  return (
    <div className="space-y-4">
      {/* Your Role - Clear indicator at the top */}
      {assumedUserRole && (
        <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  Your Role in This Document
                </p>
                <p className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                  {assumedUserRole}
                </p>
              </div>
              {verdict && (
                <div className={cn(
                  'px-4 py-2 rounded-lg border font-medium text-sm',
                  VERDICT_COLORS[verdict]
                )}>
                  {VERDICT_LABELS[verdict]}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary-600" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            <FormattedText text={summary} />
          </p>
        </CardContent>
      </Card>

      {/* Fairness Assessment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-5 w-5 text-purple-600" />
            Fairness Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            <FormattedText text={fairnessAssessment} />
          </p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">
                    <FormattedText
                      text={recommendation}
                      clauses={clauses}
                      onClauseClick={onClauseClick}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Questions to Clarify */}
      {clarifyChecklist && clarifyChecklist.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Questions to Clarify
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {clarifyChecklist.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    <FormattedText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Philippines Notes */}
      {philippinesNotes && philippinesNotes.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-blue-900 dark:text-blue-100">
              <MapPin className="h-5 w-5 text-blue-600" />
              Philippines-Specific Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {philippinesNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-blue-800 dark:text-blue-200 text-sm">
                    <FormattedText text={note} />
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {disclaimer && (
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {disclaimer}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
