'use client';

import Tesseract from 'tesseract.js';

export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return result.data.text.trim();
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
}

export async function extractTextFromPDF(pdfFile: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

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
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromScannedPDF(
  pdfFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const totalPages = pdf.numPages;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const scale = 2.0;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const imageData = canvas.toDataURL('image/png');

      const result = await Tesseract.recognize(imageData, 'eng');
      fullText += result.data.text + '\n';

      if (onProgress) {
        onProgress((i / totalPages) * 100);
      }
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from scanned PDF:', error);
    throw new Error('Failed to extract text from scanned PDF');
  }
}
