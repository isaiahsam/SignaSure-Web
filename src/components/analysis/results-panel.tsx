'use client';

import { useState } from 'react';
import {
  FileText,
  Scale,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  MapPin,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormattedText } from '@/components/ui/formatted-text';
import { type Verdict } from '@/types';

interface Flag {
  severity: string;
  title: string;
  description: string;
  recommendation?: string;
  whoItAffects?: string;
}

interface RiskBreakdown {
  fairnessRisk: number;
  enforceabilityRisk: number;
  completenessRisk: number;
  primaryDrivers: string[];
}

interface AnalysisResult {
  riskScore: number;
  summary: string;
  flags: Flag[];
  recommendations: string[];
  fairnessAssessment: string;
  assumedUserRole?: string;
  verdict?: Verdict;
  riskBreakdown?: RiskBreakdown;
  clarifyChecklist?: string[];
  philippinesNotes?: string[];
  disclaimer?: string;
}

interface ResultsPanelProps {
  analysis: AnalysisResult;
  className?: string;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  badge?: string | number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'highlight';
}

function CollapsibleSection({
  title,
  icon,
  badge,
  defaultOpen = true,
  children,
  variant = 'default',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        variant === 'highlight'
          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
          variant === 'highlight'
            ? 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span
            className={cn(
              'font-medium',
              variant === 'highlight'
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-slate-900 dark:text-slate-100'
            )}
          >
            {title}
          </span>
          {badge !== undefined && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div
          className={cn(
            'px-4 pb-4 border-t',
            variant === 'highlight'
              ? 'border-blue-200 dark:border-blue-800'
              : 'border-slate-200 dark:border-slate-700'
          )}
        >
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}

// Match the Verdict type from @/types/analysis
const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  safe_to_sign: { label: 'Safe to Sign', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  review_carefully: { label: 'Review Carefully', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  negotiate_before_signing: { label: 'Negotiate Before Signing', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  high_risk_legal_review: { label: 'High Risk - Legal Review', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  // Legacy values for backwards compatibility
  negotiate_changes: { label: 'Negotiate Changes', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  seek_legal_advice: { label: 'Seek Legal Advice', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  do_not_sign: { label: 'Do Not Sign', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
};

function RoleDisplay({ role, verdict }: { role: string; verdict?: Verdict }) {
  const verdictConfig = verdict ? VERDICT_CONFIG[verdict] : null;

  return (
    <div className="rounded-lg border border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-1">
            Your Role in This Document
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {role}
          </p>
        </div>
        {verdictConfig && (
          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', verdictConfig.bg, verdictConfig.color)}>
            {verdictConfig.label}
          </span>
        )}
      </div>
    </div>
  );
}

function RiskScoreDisplay({ score, breakdown }: { score: number; breakdown?: RiskBreakdown }) {
  const getScoreColor = (score: number) => {
    if (score <= 20) return 'text-green-600';
    if (score <= 40) return 'text-blue-600';
    if (score <= 60) return 'text-yellow-600';
    if (score <= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score <= 20) return 'bg-green-500';
    if (score <= 40) return 'bg-blue-500';
    if (score <= 60) return 'bg-yellow-500';
    if (score <= 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 20) return 'Very Low Risk';
    if (score <= 40) return 'Low Risk';
    if (score <= 60) return 'Moderate Risk';
    if (score <= 80) return 'High Risk';
    return 'Very High Risk';
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary-600" />
          <h3 className="font-medium text-slate-900 dark:text-slate-100">Risk Score</h3>
        </div>
        <div className="text-right">
          <span className={cn('text-2xl font-bold', getScoreColor(score))}>{score}</span>
          <span className="text-slate-400">/100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
        <div
          className={cn('h-full transition-all', getProgressColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={cn('text-sm font-medium', getScoreColor(score))}>{getRiskLabel(score)}</p>

      {/* Breakdown */}
      {breakdown && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Enforceability</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {breakdown.enforceabilityRisk}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Fairness</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {breakdown.fairnessRisk}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Completeness</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {breakdown.completenessRisk}%
            </span>
          </div>
          {breakdown.primaryDrivers.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Main concerns:</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {breakdown.primaryDrivers.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ResultsPanel({ analysis, className }: ResultsPanelProps) {
  const criticalFlags = analysis.flags.filter((f) => f.severity === 'critical').length;
  const highFlags = analysis.flags.filter((f) => f.severity === 'high').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Risk Score */}
      <RiskScoreDisplay score={analysis.riskScore} breakdown={analysis.riskBreakdown} />

      {/* Your Role - Below Risk Score, Above Summary */}
      {analysis.assumedUserRole && (
        <RoleDisplay role={analysis.assumedUserRole} verdict={analysis.verdict} />
      )}

      {/* Summary */}
      <CollapsibleSection
        title="Summary"
        icon={<FileText className="h-5 w-5 text-primary-600" />}
        defaultOpen={true}
      >
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <FormattedText text={analysis.summary} />
        </p>
      </CollapsibleSection>

      {/* Fairness Assessment */}
      <CollapsibleSection
        title="Fairness Assessment"
        icon={<Scale className="h-5 w-5 text-purple-600" />}
        defaultOpen={true}
      >
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <FormattedText text={analysis.fairnessAssessment} />
        </p>
      </CollapsibleSection>

      {/* Flags */}
      {analysis.flags && analysis.flags.length > 0 && (
        <CollapsibleSection
          title="Flags"
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          badge={analysis.flags.length}
          defaultOpen={criticalFlags > 0 || highFlags > 0}
        >
          <div className="space-y-3">
            {analysis.flags.map((flag, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={cn('text-xs px-2 py-0.5 rounded font-medium uppercase', {
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                        flag.severity === 'critical',
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400':
                        flag.severity === 'high',
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400':
                        flag.severity === 'medium',
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                        flag.severity === 'low',
                    })}
                  >
                    {flag.severity}
                  </span>
                  {flag.whoItAffects && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Affects: {flag.whoItAffects}
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                  {flag.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <FormattedText text={flag.description} />
                </p>
                {flag.recommendation && (
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">
                    <span className="font-medium">Tip:</span>{' '}
                    <FormattedText text={flag.recommendation} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <CollapsibleSection
          title="Recommendations"
          icon={<Lightbulb className="h-5 w-5 text-yellow-500" />}
          badge={analysis.recommendations.length}
          defaultOpen={true}
        >
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <FormattedText text={rec} />
                </span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Questions to Clarify */}
      {analysis.clarifyChecklist && analysis.clarifyChecklist.length > 0 && (
        <CollapsibleSection
          title="Questions to Clarify"
          icon={<HelpCircle className="h-5 w-5 text-blue-500" />}
          badge={analysis.clarifyChecklist.length}
          defaultOpen={false}
        >
          <ul className="space-y-2">
            {analysis.clarifyChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-blue-500 mt-0.5">?</span>
                <span className="text-slate-600 dark:text-slate-400">
                  <FormattedText text={item} />
                </span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Philippines Notes */}
      {analysis.philippinesNotes && analysis.philippinesNotes.length > 0 && (
        <CollapsibleSection
          title="Philippines-Specific Notes"
          icon={<MapPin className="h-5 w-5 text-blue-600" />}
          badge={analysis.philippinesNotes.length}
          defaultOpen={false}
          variant="highlight"
        >
          <ul className="space-y-2">
            {analysis.philippinesNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="text-blue-800 dark:text-blue-200">
                  <FormattedText text={note} />
                </span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Disclaimer */}
      {analysis.disclaimer && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <AlertCircle className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">{analysis.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
