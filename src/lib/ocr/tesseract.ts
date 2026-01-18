'use client';

import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker from CDN
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export async function extractTextFromImage(imageData: string | Blob | File): Promise<string> {
  try {
    const worker = await createWorker('eng');
    const result = await worker.recognize(imageData);
    await worker.terminate();
    return result.data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image. Please try again.');
  }
}

export async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const textParts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      textParts.push(pageText);
    }

    const extractedText = textParts.join('\n\n');

    // If PDF text extraction yields little text, it might be a scanned PDF
    if (extractedText.trim().length < 50) {
      console.log('PDF appears to be scanned, using OCR...');
      return await extractTextFromScannedPDF(pdf);
    }

    return extractedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    // Fallback: try treating as image-based PDF
    throw new Error('Failed to extract text from PDF. Please try again or upload an image.');
  }
}

async function extractTextFromScannedPDF(pdf: any): Promise<string> {
  const numPages = pdf.numPages;
  const textParts: string[] = [];
  const scale = 2.0;

  for (let i = 1; i <= Math.min(numPages, 5); i++) {
    try {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to convert canvas to blob'));
        }, 'image/png');
      });

      const pageText = await extractTextFromImage(blob);
      textParts.push(pageText);
    } catch (pageError) {
      console.error(`Error processing page ${i}:`, pageError);
    }
  }

  if (textParts.length === 0) {
    throw new Error('Could not extract text from any pages');
  }

  return textParts.join('\n\n');
}

export function getFileType(file: File): 'pdf' | 'image' | 'unknown' {
  const mimeType = file.type.toLowerCase();

  if (mimeType === 'application/pdf') {
    return 'pdf';
  }

  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  const ext = file.name.toLowerCase().split('.').pop();
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '')) return 'image';

  return 'unknown';
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = getFileType(file);

  if (fileType === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    return extractTextFromPDF(arrayBuffer);
  }

  if (fileType === 'image') {
    return extractTextFromImage(file);
  }

  throw new Error('Unsupported file type. Please upload a PDF or image file.');
}
