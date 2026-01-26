import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildAnalysisPrompt } from './prompts';
import type { DocumentType, Flag, Clause } from '@/types';

export interface AnalysisResult {
  riskScore: number;
  summary: string;
  flags: Flag[];
  importantClauses: Clause[];
  recommendations: string[];
  fairnessAssessment: string;
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

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private modelName = 'gemini-1.5-flash';

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeDocument(
    documentText: string,
    documentType: DocumentType
  ): Promise<AnalysisResult> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    // Truncate very long documents to avoid timeouts (keep first 15000 chars)
    const truncatedText = documentText.length > 15000
      ? documentText.slice(0, 15000) + '\n\n[Document truncated for analysis...]'
      : documentText;

    const prompt = buildAnalysisPrompt(truncatedText, documentType);

    try {
      // 60 second timeout
      const result = await withTimeout(
        model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
        60000
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

      const parsed = JSON.parse(cleanedText);

      // Validate and transform the response
      return this.validateAndTransform(parsed);
    } catch (error) {
      console.error('Error analyzing document with Gemini:', error);

      // Provide specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timed out')) {
          throw error;
        }
        if (error.message.includes('API key')) {
          throw new Error('Invalid API key. Please check your Gemini API configuration.');
        }
        if (error.message.includes('quota') || error.message.includes('rate')) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }
      }

      throw new Error('Failed to analyze document. Please try again.');
    }
  }

  private validateAndTransform(data: Record<string, unknown>): AnalysisResult {
    // Ensure riskScore is a number between 0-100
    const riskScore = Math.min(100, Math.max(0, Number(data.riskScore) || 50));

    // Ensure summary is a string
    const summary = String(data.summary || 'No summary available.');

    // Ensure flags is an array
    const flags: Flag[] = Array.isArray(data.flags)
      ? data.flags.map((f: Record<string, unknown>, i: number) => ({
          id: String(f.id || `flag-${i}`),
          type: this.validateFlagType(f.type),
          severity: this.validateSeverity(f.severity),
          title: String(f.title || 'Unknown Issue'),
          description: String(f.description || ''),
          originalText: f.originalText ? String(f.originalText) : undefined,
          recommendation: f.recommendation ? String(f.recommendation) : undefined,
        }))
      : [];

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
      data.fairnessAssessment || 'Unable to assess fairness.'
    );

    return {
      riskScore,
      summary,
      flags,
      importantClauses,
      recommendations,
      fairnessAssessment,
    };
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
