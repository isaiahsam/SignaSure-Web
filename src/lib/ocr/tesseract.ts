'use client';

import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use the copy in public folder
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng');
    return result.data.text.trim();
  } catch {
    throw new Error('Failed to extract text from image');
  }
}

export async function extractTextFromPDF(pdfFile: File): Promise<string> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch {
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromScannedPDF(
  pdfFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    }).promise;

    let fullText = '';
    const totalPages = pdf.numPages;

    // Create a reusable Tesseract worker for better performance
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          // Progress within current page
          const pageProgress = m.progress || 0;
          const overallProgress = ((pdf.numPages - totalPages + pageProgress) / pdf.numPages) * 100;
          onProgress(Math.min(overallProgress, 99));
        }
      },
    });

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      // Use higher scale for better OCR accuracy
      const scale = 2.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Set white background for better OCR
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const imageData = canvas.toDataURL('image/png');

      const result = await worker.recognize(imageData);
      fullText += result.data.text + '\n';

      if (onProgress) {
        onProgress((i / totalPages) * 100);
      }

      // Clean up canvas
      canvas.width = 0;
      canvas.height = 0;
    }

    // Terminate the worker when done
    await worker.terminate();

    return fullText.trim();
  } catch {
    throw new Error('Failed to extract text from scanned PDF. Please ensure the PDF contains readable text or try a clearer scan.');
  }
}
