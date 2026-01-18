'use client';

import { DocumentAnalysis } from '@/types';
import { FileText, Lightbulb, Scale, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  analysis: DocumentAnalysis;
}

export function SummaryCard({ analysis }: SummaryCardProps) {
  const getFairnessColor = (assessment: string | undefined) => {
    if (!assessment) return 'text-gray-600 bg-gray-100 border-gray-300';
    if (assessment.includes('Fair and Balanced'))
      return 'text-green-700 bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400';
    if (assessment.includes('Slightly'))
      return 'text-yellow-700 bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400';
    if (assessment.includes('Moderately'))
      return 'text-orange-700 bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400';
    if (assessment.includes('Heavily'))
      return 'text-red-700 bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400';
    return 'text-red-900 bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300';
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
        </div>
        <p className="text-gray-600 dark:text-slate-300">{analysis.summary}</p>
      </div>

      {/* Fairness Assessment */}
      {analysis.fairnessAssessment && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fairness Assessment
            </h3>
          </div>
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-4 py-2',
              getFairnessColor(analysis.fairnessAssessment)
            )}
          >
            <span className="font-semibold">{analysis.fairnessAssessment}</span>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recommendations
            </h3>
          </div>
          <ul className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                <span className="text-gray-600 dark:text-slate-300">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-700 dark:text-amber-400" />
          <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-300">Legal Disclaimer</h4>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              This analysis is provided for informational purposes only and does NOT
              constitute legal advice. SignaSure is not a substitute for professional legal
              counsel. Always consult with a qualified attorney before signing any legal
              document or making legal decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
