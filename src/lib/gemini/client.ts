import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildAnalysisPrompt } from './prompts';
import type { DocumentType, Flag, Clause, RiskBreakdown, Verdict, AffectedParty } from '@/types';

export interface AnalysisResult {
  riskScore: number;
  summary: string;
  flags: Flag[];
  importantClauses: Clause[];
  recommendations: string[];
  fairnessAssessment: string;
  // New Philippines-focused fields
  assumedUserRole?: string;
  riskBreakdown?: RiskBreakdown;
  verdict?: Verdict;
  clarifyChecklist?: string[];
  philippinesNotes?: string[];
  disclaimer?: string;
}

// Timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Analysis timed out. Please try again.')), ms)
    ),
  ]);
}

// Delay helper for retry backoff
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private modelName = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeDocument(
    documentText: string,
    documentType: DocumentType,
    userRole?: string
  ): Promise<AnalysisResult> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    // For very long documents, we'll analyze in chunks and combine results
    // Increased limit to 50000 chars to handle most documents
    const maxChars = 50000;
    let textToAnalyze = documentText;

    if (documentText.length > maxChars) {
      // For extremely long documents, take beginning, middle, and end sections
      const chunkSize = Math.floor(maxChars / 3);
      const beginning = documentText.slice(0, chunkSize);
      const middleStart = Math.floor(documentText.length / 2) - Math.floor(chunkSize / 2);
      const middle = documentText.slice(middleStart, middleStart + chunkSize);
      const end = documentText.slice(-chunkSize);
      textToAnalyze = `${beginning}\n\n[... middle section ...]\n\n${middle}\n\n[... end section ...]\n\n${end}`;
    }

    const prompt = buildAnalysisPrompt(textToAnalyze, documentType, userRole);

    // Retry logic for rate limits
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 90 second timeout for longer documents
        const result = await withTimeout(
          model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0,
              topK: 1,
              topP: 1,
              maxOutputTokens: 16384, // Increased from 4096 to handle detailed analysis
              responseMimeType: 'application/json',
            },
          }),
          90000
        );

        const response = await result.response;
        const text = response.text();

        // Clean the response text
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.slice(7);
        }
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
          cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();

        // Try to parse JSON, with repair attempt if it fails
        let parsed;
        try {
          parsed = JSON.parse(cleanedText);
        } catch {
          // Try to repair truncated JSON
          parsed = this.repairAndParseJSON(cleanedText);
        }

        // Validate and transform the response
        return this.validateAndTransform(parsed);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if this is a rate limit error - if so, wait and retry
        const isRateLimit =
          lastError.message.includes('quota') ||
          lastError.message.includes('rate') ||
          lastError.message.includes('429') ||
          lastError.message.includes('Resource has been exhausted');

        if (isRateLimit && attempt < maxRetries) {
          // Exponential backoff: 10s, 20s, 40s
          const waitTime = 10000 * Math.pow(2, attempt - 1);
          await delay(waitTime);
          continue;
        }

        // For non-rate-limit errors, or if we've exhausted retries, handle the error
        if (lastError.message.includes('timed out')) {
          throw lastError;
        }
        if (lastError.message.includes('API key') || lastError.message.includes('API_KEY')) {
          throw new Error('Invalid API key. Please check your Gemini API configuration.');
        }
        if (isRateLimit) {
          throw new Error('API rate limit exceeded. Please wait a minute and try again.');
        }
        if (lastError.message.includes('not found') || lastError.message.includes('404')) {
          throw new Error('Gemini model not found. The model may have been updated.');
        }
        // Pass through the actual error message for debugging
        throw new Error(`Gemini API error: ${lastError.message}`);
      }
    }

    // This shouldn't be reached, but just in case
    throw lastError || new Error('Failed to analyze document. Please try again.');
  }

  private repairAndParseJSON(text: string): Record<string, unknown> {
    // Try to repair truncated JSON by closing open brackets/braces
    let repaired = text;

    // Count open brackets and braces
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escapeNext = false;

    for (const char of repaired) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
      }
    }

    // If we're in a string, close it
    if (inString) {
      repaired += '"';
    }

    // Remove trailing comma if present
    repaired = repaired.replace(/,\s*$/, '');

    // Close any open brackets and braces
    while (openBrackets > 0) {
      repaired += ']';
      openBrackets--;
    }
    while (openBraces > 0) {
      repaired += '}';
      openBraces--;
    }

    try {
      return JSON.parse(repaired);
    } catch {
      // Try to extract partial data using regex
      const partialData: Record<string, unknown> = {};

      // Try to extract riskScore
      const riskMatch = text.match(/"riskScore"\s*:\s*(\d+)/);
      if (riskMatch) {
        partialData.riskScore = parseInt(riskMatch[1], 10);
      }

      // Try to extract summary
      const summaryMatch = text.match(/"summary"\s*:\s*"([^"]+)"/);
      if (summaryMatch) {
        partialData.summary = summaryMatch[1];
      }

      // Try to extract fairnessAssessment
      const fairnessMatch = text.match(/"fairnessAssessment"\s*:\s*"([^"]+)"/);
      if (fairnessMatch) {
        partialData.fairnessAssessment = fairnessMatch[1];
      }

      // If we got at least a risk score, return partial data
      if (partialData.riskScore !== undefined) {
        return {
          ...partialData,
          flags: [],
          importantClauses: [],
          recommendations: partialData.summary
            ? ['Review the document carefully as some analysis details may be incomplete.']
            : [],
        };
      }

      // Complete failure - throw an error to trigger retry logic
      throw new Error('Unable to parse analysis response. Please try again.');
    }
  }

  private validateAndTransform(data: Record<string, unknown>): AnalysisResult {
    // Ensure flags is an array - process this first so we can use it for risk calculation
    const flags: Flag[] = Array.isArray(data.flags)
      ? data.flags.map((f: Record<string, unknown>, i: number) => ({
          id: String(f.id || `flag-${i}`),
          type: this.validateFlagType(f.type),
          severity: this.validateSeverity(f.severity),
          title: String(f.title || 'Unknown Issue'),
          description: String(f.description || ''),
          originalText: f.originalText ? String(f.originalText) : undefined,
          recommendation: f.recommendation ? String(f.recommendation) : undefined,
          whoItAffects: this.validateAffectedParty(f.whoItAffects),
        }))
      : [];

    // Calculate risk score - use AI's score if valid, otherwise calculate from flags
    let riskScore: number;
    if (typeof data.riskScore === 'number' && data.riskScore >= 0 && data.riskScore <= 100) {
      riskScore = data.riskScore;
    } else if (typeof data.riskScore === 'string' && !isNaN(parseInt(data.riskScore, 10))) {
      riskScore = Math.min(100, Math.max(0, parseInt(data.riskScore, 10)));
    } else {
      // Calculate risk score based on flags if AI didn't provide one
      riskScore = this.calculateRiskFromFlags(flags);
    }

    // Ensure summary is a string
    const summary = String(data.summary || 'No summary available.');

    // Ensure importantClauses is an array
    const importantClauses: Clause[] = Array.isArray(data.importantClauses)
      ? data.importantClauses.map((c: Record<string, unknown>, i: number) => ({
          id: String(c.id || `clause-${i}`),
          title: String(c.title || 'Unknown Clause'),
          originalText: String(c.originalText || ''),
          simplifiedExplanation: String(c.simplifiedExplanation || ''),
          importance: this.validateImportance(c.importance),
        }))
      : [];

    // Ensure recommendations is an array of strings
    const recommendations: string[] = Array.isArray(data.recommendations)
      ? data.recommendations.map((r: unknown) => String(r))
      : [];

    // Ensure fairnessAssessment is a string
    const fairnessAssessment = String(
      data.fairnessAssessment || 'No specific fairness concerns identified.'
    );

    // New Philippines-focused fields
    const assumedUserRole = data.assumedUserRole ? String(data.assumedUserRole) : undefined;

    const riskBreakdown = this.validateRiskBreakdown(data.riskBreakdown);

    const verdict = this.validateVerdict(data.verdict);

    const clarifyChecklist: string[] = Array.isArray(data.clarifyChecklist)
      ? data.clarifyChecklist.map((item: unknown) => String(item))
      : [];

    const philippinesNotes: string[] = Array.isArray(data.philippinesNotes)
      ? data.philippinesNotes.map((note: unknown) => String(note))
      : [];

    const disclaimer = data.disclaimer
      ? String(data.disclaimer)
      : 'This is general information, not legal advice. Consider consulting a Philippine lawyer for advice on your specific situation.';

    return {
      riskScore,
      summary,
      flags,
      importantClauses,
      recommendations,
      fairnessAssessment,
      assumedUserRole,
      riskBreakdown,
      verdict,
      clarifyChecklist,
      philippinesNotes,
      disclaimer,
    };
  }

  private validateRiskBreakdown(data: unknown): RiskBreakdown | undefined {
    if (!data || typeof data !== 'object') return undefined;

    const breakdown = data as Record<string, unknown>;
    return {
      fairnessRisk: Math.min(100, Math.max(0, Number(breakdown.fairnessRisk) || 0)),
      enforceabilityRisk: Math.min(100, Math.max(0, Number(breakdown.enforceabilityRisk) || 0)),
      completenessRisk: Math.min(100, Math.max(0, Number(breakdown.completenessRisk) || 0)),
      primaryDrivers: Array.isArray(breakdown.primaryDrivers)
        ? breakdown.primaryDrivers.map((d: unknown) => String(d))
        : [],
    };
  }

  private validateVerdict(verdict: unknown): Verdict {
    const validVerdicts: Verdict[] = [
      'safe_to_sign',
      'review_carefully',
      'negotiate_before_signing',
      'high_risk_legal_review',
    ];
    return validVerdicts.includes(verdict as Verdict)
      ? (verdict as Verdict)
      : 'review_carefully'; // Default to review_carefully
  }

  private validateAffectedParty(party: unknown): AffectedParty {
    const validParties: AffectedParty[] = ['user', 'counterparty', 'both'];
    return validParties.includes(party as AffectedParty)
      ? (party as AffectedParty)
      : 'user';
  }

  private calculateRiskFromFlags(flags: Flag[]): number {
    // If no flags, document is low risk
    if (flags.length === 0) {
      return 15; // Low risk - no concerns found
    }

    // Calculate risk based on flag severities
    let riskPoints = 0;
    for (const flag of flags) {
      switch (flag.severity) {
        case 'critical':
          riskPoints += 25;
          break;
        case 'high':
          riskPoints += 15;
          break;
        case 'medium':
          riskPoints += 8;
          break;
        case 'low':
          riskPoints += 3;
          break;
      }
    }

    // Base risk of 20 plus flag-based risk, capped at 100
    return Math.min(100, 20 + riskPoints);
  }

  private validateFlagType(
    type: unknown
  ):
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
    | 'other' {
    const validTypes = [
      'liability',
      'termination',
      'payment',
      'intellectual_property',
      'confidentiality',
      'dispute',
      'renewal',
      'penalty',
      'obligation',
      'property',
      'notarization',
      'other',
    ] as const;
    return validTypes.includes(type as (typeof validTypes)[number])
      ? (type as (typeof validTypes)[number])
      : 'other';
  }

  private validateSeverity(severity: unknown): 'low' | 'medium' | 'high' | 'critical' {
    const validSeverities = ['low', 'medium', 'high', 'critical'] as const;
    return validSeverities.includes(severity as (typeof validSeverities)[number])
      ? (severity as (typeof validSeverities)[number])
      : 'medium';
  }

  private validateImportance(importance: unknown): 'low' | 'medium' | 'high' {
    const validImportance = ['low', 'medium', 'high'] as const;
    return validImportance.includes(importance as (typeof validImportance)[number])
      ? (importance as (typeof validImportance)[number])
      : 'medium';
  }
}
