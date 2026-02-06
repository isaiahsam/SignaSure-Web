import { NextRequest, NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/gemini/client';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import type { DocumentType, AnalysisResponse } from '@/types';

// Allowed document types for validation
const ALLOWED_DOCUMENT_TYPES: DocumentType[] = [
  'employment',
  'lease',
  'nda',
  'service',
  'purchase',
  'loan',
  'partnership',
  'other',
];

// Maximum text length allowed (50KB of text)
const MAX_TEXT_LENGTH = 50000;

// Daily analysis limit per user
const DAILY_LIMIT = 10;

export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  try {
    // Check for authorization header (Firebase ID token)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token server-side
    const token = authHeader.substring(7);
    let userId: string;

    try {
      const decodedToken = await getAdminAuth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired authentication token',
        },
        { status: 401 }
      );
    }

    // Server-side rate limiting
    const today = new Date().toISOString().split('T')[0];
    const db = getAdminFirestore();
    const usageRef = db.doc(`users/${userId}/usage/${today}`);
    const usageSnap = await usageRef.get();
    const currentCount = usageSnap.exists ? (usageSnap.data()?.analysisCount || 0) : 0;

    if (currentCount >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: 'Daily analysis limit reached. Please try again tomorrow.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { extractedText, documentType, documentId, userRole } = body as {
      extractedText: string;
      documentType: DocumentType;
      documentId: string;
      userRole?: string;
    };

    // Validate required fields
    if (!extractedText || !documentType || !documentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: extractedText, documentType, or documentId',
        },
        { status: 400 }
      );
    }

    // Validate documentId format to prevent injection
    if (!/^[a-zA-Z0-9_-]+$/.test(documentId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid document identifier format',
        },
        { status: 400 }
      );
    }

    // Validate document type
    if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid document type',
        },
        { status: 400 }
      );
    }

    // Validate text length
    if (extractedText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document text exceeds maximum allowed length',
        },
        { status: 400 }
      );
    }

    // Validate text has meaningful content
    if (extractedText.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document text is too short for analysis',
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service is not configured. Please contact support.',
        },
        { status: 500 }
      );
    }

    const client = new GeminiClient(apiKey);
    const result = await client.analyzeDocument(extractedText, documentType, userRole);

    return NextResponse.json({
      success: true,
      analysis: {
        id: '', // Will be set by Firestore
        documentId,
        userId,
        ...result,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    // Log errors server-side only (not exposed to client)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in analyze API:', error);
    }

    let errorMessage = 'An unexpected error occurred during analysis';
    if (error instanceof Error) {
      // Only expose safe error messages to client
      if (error.message.includes('timed out')) {
        errorMessage = 'Analysis timed out. Please try again.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Service is busy. Please wait a moment and try again.';
      } else if (error.message.includes('Firebase Admin SDK not configured')) {
        errorMessage = 'Server authentication is not configured. Please contact support.';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
