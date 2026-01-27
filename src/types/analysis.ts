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
  | 'property'
  | 'notarization'
  | 'other';

export type FlagSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AffectedParty = 'user' | 'counterparty' | 'both';

export type Verdict = 'safe_to_sign' | 'review_carefully' | 'negotiate_before_signing' | 'high_risk_legal_review';

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
  property: 'Property Terms',
  notarization: 'Notarization/Documentation',
  other: 'Other',
};

export const SEVERITY_LABELS: Record<FlagSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  safe_to_sign: 'Safe to Sign',
  review_carefully: 'Review Carefully',
  negotiate_before_signing: 'Negotiate Before Signing',
  high_risk_legal_review: 'High Risk - Legal Review Recommended',
};

export const VERDICT_COLORS: Record<Verdict, string> = {
  safe_to_sign: 'text-green-600 bg-green-50 border-green-200',
  review_carefully: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  negotiate_before_signing: 'text-orange-600 bg-orange-50 border-orange-200',
  high_risk_legal_review: 'text-red-600 bg-red-50 border-red-200',
};

export interface Flag {
  id: string;
  type: FlagType;
  severity: FlagSeverity;
  title: string;
  description: string;
  originalText?: string;
  recommendation?: string;
  whoItAffects?: AffectedParty;
}

export interface RiskBreakdown {
  fairnessRisk: number;
  enforceabilityRisk: number;
  completenessRisk: number;
  primaryDrivers: string[];
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
  // New Philippines-focused fields
  assumedUserRole?: string;
  riskBreakdown?: RiskBreakdown;
  verdict?: Verdict;
  clarifyChecklist?: string[];
  philippinesNotes?: string[];
  disclaimer?: string;
}

export interface AnalysisRequest {
  documentId: string;
  extractedText: string;
  documentType: string;
  userRole?: string; // Optional - AI will infer if not provided
}

// Common user roles for different document types
export const USER_ROLES: Record<string, { value: string; label: string; description: string }[]> = {
  lease: [
    { value: '', label: 'Let AI determine', description: 'AI will figure out your role' },
    { value: 'tenant', label: 'I am the Tenant', description: 'You are renting the property' },
    { value: 'landlord', label: 'I am the Landlord', description: 'You own the property being rented' },
  ],
  employment: [
    { value: '', label: 'Let AI determine', description: 'AI will figure out your role' },
    { value: 'employee', label: 'I am the Employee', description: 'You are being hired for this job' },
    { value: 'employer', label: 'I am the Employer', description: 'You are hiring someone' },
  ],
  purchase: [
    { value: '', label: 'Let AI determine', description: 'AI will figure out your role' },
    { value: 'buyer', label: 'I am the Buyer', description: 'You are buying something' },
    { value: 'seller', label: 'I am the Seller', description: 'You are selling something' },
  ],
  loan: [
    { value: '', label: 'Let AI determine', description: 'AI will figure out your role' },
    { value: 'borrower', label: 'I am the Borrower', description: 'You are borrowing money' },
    { value: 'lender', label: 'I am the Lender', description: 'You are lending money' },
  ],
  service: [
    { value: '', label: 'Let AI determine', description: 'AI will figure out your role' },
    { value: 'client', label: 'I am the Client', description: 'You are paying for a service' },
    { value: 'provider', label: 'I am the Service Provider', description: 'You are providing the service' },
  ],
  nda: [
    { value: '', label: 'Let AI determine', description: 'AI will figure out your role' },
    { value: 'disclosing', label: 'I am sharing the information', description: 'You are disclosing confidential info' },
    { value: 'receiving', label: 'I am receiving the information', description: 'You are receiving confidential info' },
  ],
  partnership: [
    { value: '', label: 'Let AI determine', description: 'AI will figure out your role' },
    { value: 'partner', label: 'I am a Partner', description: 'You are one of the business partners' },
  ],
  other: [
    { value: '', label: 'Let AI determine', description: 'AI will figure out your role' },
    { value: 'signing_party', label: 'I am signing this document', description: 'Someone gave you this document to sign' },
    { value: 'requesting_party', label: 'I created this document', description: 'You made this document for someone else to sign' },
  ],
};

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
