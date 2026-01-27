'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import react-pdf styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Dynamically import react-pdf with SSR disabled
const PDFDocument = dynamic(
  () => import('react-pdf').then((mod) => {
    // Configure PDF.js worker
    mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
    return mod.Document;
  }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div> }
);

const PDFPage = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
);

interface DocumentViewerProps {
  fileUrl: string | null;
  fileName: string;
  fileType: string;
  extractedText?: string;
  className?: string;
}

export function DocumentViewer({
  fileUrl,
  fileName,
  fileType,
  extractedText,
  className,
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isPdf = fileType === 'application/pdf';
  const isImage = fileType.startsWith('image/');

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error('PDF load error:', err);
    setError('Failed to load PDF. Showing extracted text instead.');
    setIsLoading(false);
  }, []);

  const goToPrevPage = () => setPageNumber((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(numPages, prev + 1));

  const zoomIn = () => setScale((prev) => Math.min(2.0, prev + 0.25));
  const zoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.25));
  const resetZoom = () => setScale(1.0);

  if (!fileUrl) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm',
          className
        )}
      >
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <FileText className="h-12 w-12 mb-3" />
          <p className="text-sm">No document to display</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden',
        className
      )}
    >
      {/* Header/Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 min-w-0">
          {isPdf ? (
            <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
          ) : (
            <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
            {fileName}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
            title="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div className="relative overflow-auto bg-slate-100 dark:bg-slate-900" style={{ maxHeight: '60vh' }}>
        {isPdf && !error ? (
          <div className="flex flex-col items-center py-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            )}
            <PDFDocument
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              className="flex justify-center"
            >
              <PDFPage
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
              />
            </PDFDocument>
          </div>
        ) : isImage && !error ? (
          <div className="flex justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt={fileName}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('Failed to load image');
                setIsLoading(false);
              }}
              style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
              className="max-w-full h-auto shadow-lg transition-transform"
            />
          </div>
        ) : (
          /* Fallback: Show extracted text */
          <div className="p-4">
            {error && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
              </div>
            )}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Extracted Text
              </h4>
              <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono max-h-96 overflow-auto">
                {extractedText || 'No text extracted'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Page Navigation (PDF only) */}
      {isPdf && numPages > 0 && !error && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page <span className="font-medium">{pageNumber}</span> of{' '}
            <span className="font-medium">{numPages}</span>
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-400"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Document Info */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isPdf && numPages > 0 ? `${numPages} page${numPages > 1 ? 's' : ''}` : fileType.split('/')[1]?.toUpperCase() || 'Document'}
        </p>
      </div>
    </div>
  );
}
