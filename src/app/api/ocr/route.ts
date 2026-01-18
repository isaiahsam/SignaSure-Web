import { NextRequest, NextResponse } from 'next/server';

// Note: OCR is handled client-side with Tesseract.js for browser-based processing
// This endpoint is kept for potential future server-side processing

export async function POST(request: NextRequest) {
  try {
    // For now, return an error indicating client-side processing should be used
    return NextResponse.json(
      {
        success: false,
        error: 'OCR is processed client-side. Use extractTextFromFile() from lib/ocr instead.',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { success: false, error: 'OCR processing failed' },
      { status: 500 }
    );
  }
}
