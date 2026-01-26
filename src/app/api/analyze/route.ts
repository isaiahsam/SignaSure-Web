import { NextRequest, NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/gemini/client';
import type { DocumentType, AnalysisResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  try {
    const body = await request.json();
    const { extractedText, documentType, documentId } = body as {
      extractedText: string;
      documentType: DocumentType;
      documentId: string;
    };

    if (!extractedText || !documentType || !documentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: extractedText, documentType, or documentId',
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'AI service is not configured. Please contact support.',
        },
        { status: 500 }
      );
    }

    const client = new GeminiClient(apiKey);
    const result = await client.analyzeDocument(extractedText, documentType);

    return NextResponse.json({
      success: true,
      analysis: {
        id: '', // Will be set by Firestore
        documentId,
        userId: '', // Will be set by client
        ...result,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error in analyze API:', error);

    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Include stack trace in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Stack trace:', error.stack);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        // Include more details in development
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
