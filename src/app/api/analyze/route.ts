import { NextRequest, NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/gemini';
import { DocumentType, FlagType, FlagSeverity, ClauseImportance } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, documentType } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid text parameter' },
        { status: 400 }
      );
    }

    if (text.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'Document text is too short. Please ensure the document contains readable text.' },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = Object.values(DocumentType);
    const docType = validTypes.includes(documentType as DocumentType)
      ? (documentType as DocumentType)
      : DocumentType.other;

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Call Gemini API
    const client = new GeminiClient(apiKey);
    const analysisResponse = await client.analyzeDocument(text, docType);

    // Parse the response into our types
    const analysis = {
      documentTitle: analysisResponse.documentTitle,
      flags: analysisResponse.flags.map((flag) => ({
        type: parseFlagType(flag.type),
        title: flag.title,
        description: flag.description,
        severity: parseFlagSeverity(flag.severity),
        highlightedText: flag.highlightedText,
      })),
      importantClauses: analysisResponse.importantClauses.map((clause) => ({
        title: clause.title,
        originalText: clause.originalText,
        simplifiedExplanation: clause.simplifiedExplanation,
        importance: parseClauseImportance(clause.importance),
      })),
      riskScore: analysisResponse.riskScore,
      summary: analysisResponse.summary,
      recommendations: analysisResponse.recommendations,
      fairnessAssessment: analysisResponse.fairnessAssessment,
    };

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error('Error details:', errorDetails);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

function parseFlagType(type: string): FlagType {
  const typeMap: Record<string, FlagType> = {
    hiddenfee: FlagType.hiddenFee,
    unfavorableterm: FlagType.unfavorableTerm,
    missingclause: FlagType.missingClause,
    loophole: FlagType.loophole,
    automaticrenewal: FlagType.automaticRenewal,
    penaltyclause: FlagType.penaltyClause,
    limitedliability: FlagType.limitedLiability,
  };
  return typeMap[type.toLowerCase()] || FlagType.other;
}

function parseFlagSeverity(severity: string): FlagSeverity {
  const severityMap: Record<string, FlagSeverity> = {
    low: FlagSeverity.low,
    medium: FlagSeverity.medium,
    high: FlagSeverity.high,
    critical: FlagSeverity.critical,
  };
  return severityMap[severity.toLowerCase()] || FlagSeverity.low;
}

function parseClauseImportance(importance: string): ClauseImportance {
  const importanceMap: Record<string, ClauseImportance> = {
    low: ClauseImportance.low,
    medium: ClauseImportance.medium,
    high: ClauseImportance.high,
    critical: ClauseImportance.critical,
  };
  return importanceMap[importance.toLowerCase()] || ClauseImportance.medium;
}
