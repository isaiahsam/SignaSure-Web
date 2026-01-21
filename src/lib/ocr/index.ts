'use client';

import {
  extractTextFromImage,
  extractTextFromPDF,
  extractTextFromScannedPDF,
} from './tesseract';

export interface ExtractTextOptions {
  onProgress?: (progress: number) => void;
  forceOCR?: boolean;
}

export async function extractText(
  file: File,
  options: ExtractTextOptions = {}
): Promise<string> {
  const { onProgress, forceOCR = false } = options;
  const fileType = file.type;

  // Handle images
  if (fileType.startsWith('image/')) {
    return extractTextFromImage(file);
  }

  // Handle PDFs
  if (fileType === 'application/pdf') {
    // First try regular PDF text extraction
    if (!forceOCR) {
      try {
        const text = await extractTextFromPDF(file);
        // If we got meaningful text, return it
        if (text.length > 50) {
          return text;
        }
      } catch {
        // Fall through to OCR
      }
    }

    // If regular extraction failed or returned little text, try OCR
    return extractTextFromScannedPDF(file, onProgress);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

export { extractTextFromImage, extractTextFromPDF, extractTextFromScannedPDF };
