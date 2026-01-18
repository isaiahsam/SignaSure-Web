// Document types matching Flutter models

export enum DocumentType {
  contract = 'contract',
  lease = 'lease',
  loan = 'loan',
  insurance = 'insurance',
  employment = 'employment',
  other = 'other',
}

export enum FlagType {
  hiddenFee = 'hiddenFee',
  unfavorableTerm = 'unfavorableTerm',
  missingClause = 'missingClause',
  loophole = 'loophole',
  automaticRenewal = 'automaticRenewal',
  penaltyClause = 'penaltyClause',
  limitedLiability = 'limitedLiability',
  other = 'other',
}

export enum FlagSeverity {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

export enum ClauseImportance {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

export interface AnalysisFlag {
  type: FlagType;
  title: string;
  description: string;
  severity: FlagSeverity;
  highlightedText: string;
}

export interface ImportantClause {
  title: string;
  originalText: string;
  simplifiedExplanation: string;
  importance: ClauseImportance;
}

export interface DocumentAnalysis {
  documentTitle?: string;
  flags: AnalysisFlag[];
  importantClauses: ImportantClause[];
  riskScore: number;
  summary: string;
  recommendations: string[];
  fairnessAssessment?: string;
}

export interface Document {
  id: string;
  fileName: string;
  uploadDate: Date;
  type: DocumentType;
  extractedText?: string;
  analysis?: DocumentAnalysis;
  isFavorite: boolean;
  customTitle?: string;
}

// Helper functions for flag priority calculation
export function getFlagPriorityScore(flag: AnalysisFlag): number {
  // Base score from severity
  let baseScore: number;
  switch (flag.severity) {
    case FlagSeverity.critical:
      baseScore = 100;
      break;
    case FlagSeverity.high:
      baseScore = 70;
      break;
    case FlagSeverity.medium:
      baseScore = 40;
      break;
    case FlagSeverity.low:
    default:
      baseScore = 10;
      break;
  }

  // Add weight based on flag type
  let typeBonus: number;
  switch (flag.type) {
    case FlagType.hiddenFee:
      typeBonus = 15;
      break;
    case FlagType.loophole:
      typeBonus = 15;
      break;
    case FlagType.penaltyClause:
      typeBonus = 12;
      break;
    case FlagType.unfavorableTerm:
      typeBonus = 10;
      break;
    case FlagType.limitedLiability:
      typeBonus = 8;
      break;
    case FlagType.automaticRenewal:
      typeBonus = 7;
      break;
    case FlagType.missingClause:
      typeBonus = 5;
      break;
    case FlagType.other:
    default:
      typeBonus = 0;
      break;
  }

  return baseScore + typeBonus;
}

export function getFlagActionLabel(priorityScore: number): string {
  if (priorityScore >= 100) return 'ADDRESS IMMEDIATELY';
  if (priorityScore >= 80) return 'DISCUSS WITH LAWYER';
  if (priorityScore >= 50) return 'NEGOTIATE THIS';
  return 'BE AWARE';
}

export function getFlagPriorityRank(priorityScore: number): string {
  if (priorityScore >= 100) return 'P1 - CRITICAL';
  if (priorityScore >= 70) return 'P2 - HIGH';
  if (priorityScore >= 40) return 'P3 - MEDIUM';
  return 'P4 - LOW';
}

export function getFlagTypeDisplayName(type: FlagType): string {
  switch (type) {
    case FlagType.hiddenFee:
      return 'Hidden Fee';
    case FlagType.unfavorableTerm:
      return 'Unfavorable Term';
    case FlagType.missingClause:
      return 'Missing Clause';
    case FlagType.loophole:
      return 'Loophole';
    case FlagType.automaticRenewal:
      return 'Auto Renewal';
    case FlagType.penaltyClause:
      return 'Penalty Clause';
    case FlagType.limitedLiability:
      return 'Limited Liability';
    case FlagType.other:
    default:
      return 'Other Issue';
  }
}

// Helper to get display title for a document
export function getDocumentDisplayTitle(doc: Document): string {
  return doc.customTitle || doc.analysis?.documentTitle || doc.fileName;
}
