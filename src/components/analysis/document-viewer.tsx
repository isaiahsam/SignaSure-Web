'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const isPdf = fileType === 'application/pdf';
  const isImage = fileType.startsWith('image/');

  // Fetch the PDF as a blob to bypass Firebase Storage's X-Frame-Options header
  useEffect(() => {
    if (!fileUrl || !isPdf) return;

    let revoked = false;
    const controller = new AbortController();

    fetch(fileUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch PDF');
        return res.blob();
      })
      .then((blob) => {
        if (revoked) return;
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Failed to fetch PDF as blob:', err);
        setError('Failed to load PDF preview');
        setIsLoading(false);
      });

    return () => {
      revoked = true;
      controller.abort();
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [fileUrl, isPdf]);

  const zoomIn = () => setScale((prev) => Math.min(2.5, prev + 0.25));
  const zoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.25));
  const resetZoom = () => setScale(1.0);

  const openInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  // The URL to use for iframe src — prefer blobUrl for PDFs to bypass CORS/frame restrictions
  const iframeSrc = isPdf ? blobUrl : fileUrl;

  // If no fileUrl, show a message that preview is not available
  if (!fileUrl) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          <FileText className="h-5 w-5 text-primary-500 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
            {fileName}
          </span>
        </div>

        {/* No Preview Message */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900">
          <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            Preview Not Available
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[250px]">
            File may be too large (&gt;750KB) or was uploaded before this feature. Analysis is shown on the right.
          </p>
        </div>
      </div>
    );
  }

  // Fullscreen modal for PDF
  if (showFullscreen && isPdf) {
    return (
      <>
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {fileName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openInNewTab}
                  className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </button>
                <button
                  onClick={() => setShowFullscreen(false)}
                  className="px-3 py-1.5 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Close
                </button>
              </div>
            </div>
            {iframeSrc ? (
              <iframe
                src={`${iframeSrc}#toolbar=1&navpanes=1&scrollbar=1`}
                className="flex-1 w-full"
                title={fileName}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            )}
          </div>
        </div>
        {/* Keep the small preview visible behind */}
        <DocumentViewerContent
          fileUrl={fileUrl}
          iframeSrc={iframeSrc}
          fileName={fileName}
          className={className}
          scale={scale}
          isLoading={isLoading}
          error={error}
          isPdf={isPdf}
          isImage={isImage}
          setIsLoading={setIsLoading}
          setError={setError}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
          openInNewTab={openInNewTab}
          setShowFullscreen={setShowFullscreen}
        />
      </>
    );
  }

  return (
    <DocumentViewerContent
      fileUrl={fileUrl}
      iframeSrc={iframeSrc}
      fileName={fileName}
      className={className}
      scale={scale}
      isLoading={isLoading}
      error={error}
      isPdf={isPdf}
      isImage={isImage}
      setIsLoading={setIsLoading}
      setError={setError}
      zoomIn={zoomIn}
      zoomOut={zoomOut}
      resetZoom={resetZoom}
      openInNewTab={openInNewTab}
      setShowFullscreen={setShowFullscreen}
    />
  );
}

interface DocumentViewerContentProps {
  fileUrl: string;
  iframeSrc: string | null;
  fileName: string;
  className?: string;
  scale: number;
  isLoading: boolean;
  error: string | null;
  isPdf: boolean;
  isImage: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  openInNewTab: () => void;
  setShowFullscreen: (show: boolean) => void;
}

function DocumentViewerContent({
  fileUrl,
  iframeSrc,
  fileName,
  className,
  scale,
  isLoading,
  error,
  isPdf,
  isImage,
  setIsLoading,
  setError,
  zoomIn,
  zoomOut,
  resetZoom,
  openInNewTab,
  setShowFullscreen,
}: DocumentViewerContentProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full',
        className
      )}
    >
      {/* Header/Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
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

        {/* Controls */}
        <div className="flex items-center gap-1">
          {isImage && (
            <>
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
                disabled={scale >= 2.5}
                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
            </>
          )}
          {isPdf && (
            <button
              onClick={() => setShowFullscreen(true)}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
          )}
          <button
            onClick={openInNewTab}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Document Content - Scrollable */}
      <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 relative">
        {isPdf && !error ? (
          <>
            {(isLoading || !iframeSrc) && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            )}
            {iframeSrc && (
              <iframe
                src={`${iframeSrc}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                className="w-full h-full min-h-[500px]"
                title={fileName}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError('Failed to load PDF');
                  setIsLoading(false);
                }}
              />
            )}
          </>
        ) : isImage && !error ? (
          <div className="flex justify-center items-center p-4 min-h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            )}
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
          /* Fallback: Show error message */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {error && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
              </div>
            )}
            <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Unable to display document
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Try opening in a new tab
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
