// Analysis-related types for API responses

export interface GeminiAnalysisResponse {
  documentTitle: string;
  flags: {
    type: string;
    title: string;
    description: string;
    severity: string;
    highlightedText: string;
  }[];
  importantClauses: {
    title: string;
    originalText: string;
    simplifiedExplanation: string;
    importance: string;
  }[];
  riskScore: number;
  summary: string;
  recommendations: string[];
  fairnessAssessment: string;
}

export interface AnalyzeRequestBody {
  text: string;
  documentType: string;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: GeminiAnalysisResponse;
  error?: string;
}

export interface OCRRequestBody {
  file: string; // Base64 encoded file
  fileType: string; // 'pdf' | 'image'
}

export interface OCRResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface RateLimitStatus {
  canProceed: boolean;
  remaining: number;
  resetTime: Date;
  limitType: 'hourly' | 'daily' | 'available';
  message: string;
  hourlyResetTime?: Date;
  dailyResetTime?: Date;
}

export interface UsageStats {
  usedThisHour: number;
  usedToday: number;
  remainingThisHour: number;
  remainingToday: number;
  maxPerHour: number;
  maxPerDay: number;
}
