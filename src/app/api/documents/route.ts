import { NextRequest, NextResponse } from 'next/server';

// Note: Document operations are handled through Firebase client SDK
// These endpoints are provided for potential future server-side operations

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Document operations are handled client-side through Firebase SDK',
    },
    { status: 400 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Document operations are handled client-side through Firebase SDK',
    },
    { status: 400 }
  );
}
