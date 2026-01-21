export type FlagType =
  | 'liability'
  | 'termination'
  | 'payment'
  | 'intellectual_property'
  | 'confidentiality'
  | 'dispute'
  | 'renewal'
  | 'penalty'
  | 'obligation'
  | 'other';

export type FlagSeverity = 'low' | 'medium' | 'high' | 'critical';

export const FLAG_TYPE_LABELS: Record<FlagType, string> = {
  liability: 'Liability Concern',
  termination: 'Termination Clause',
  payment: 'Payment Terms',
  intellectual_property: 'Intellectual Property',
  confidentiality: 'Confidentiality',
  dispute: 'Dispute Resolution',
  renewal: 'Renewal/Extension',
  penalty: 'Penalty Clause',
  obligation: 'Obligation',
  other: 'Other',
};

export const SEVERITY_LABELS: Record<FlagSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export interface Flag {
  id: string;
  type: FlagType;
  severity: FlagSeverity;
  title: string;
  description: string;
  originalText?: string;
  recommendation?: string;
}

export interface Clause {
  id: string;
  title: string;
  originalText: string;
  simplifiedExplanation: string;
  importance: 'low' | 'medium' | 'high';
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  userId: string;
  riskScore: number;
  summary: string;
  flags: Flag[];
  importantClauses: Clause[];
  recommendations: string[];
  fairnessAssessment: string;
  createdAt: Date;
}

export interface AnalysisRequest {
  documentId: string;
  extractedText: string;
  documentType: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: DocumentAnalysis;
  error?: string;
}

export function getSeverityPriority(severity: FlagSeverity): number {
  const priorities: Record<FlagSeverity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return priorities[severity];
}

export function sortFlagsBySeverity(flags: Flag[]): Flag[] {
  return [...flags].sort(
    (a, b) => getSeverityPriority(b.severity) - getSeverityPriority(a.severity)
  );
}

export function getImportancePriority(importance: 'low' | 'medium' | 'high'): number {
  const priorities = { high: 3, medium: 2, low: 1 };
  return priorities[importance];
}

export function sortClausesByImportance(clauses: Clause[]): Clause[] {
  return [...clauses].sort(
    (a, b) => getImportancePriority(b.importance) - getImportancePriority(a.importance)
  );
}
