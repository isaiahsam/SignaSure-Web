'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { cn, formatFileSize } from '@/lib/utils';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  progress?: number;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function UploadDropzone({
  onFileSelect,
  isProcessing = false,
  progress = 0,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
}: UploadDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const errorMessage = rejection.errors[0]?.message || 'File not accepted';
        setError(errorMessage);
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isProcessing,
  });

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-colors cursor-pointer',
            'flex flex-col items-center justify-center text-center',
            isDragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500',
            isProcessing && 'pointer-events-none opacity-50'
          )}
        >
          <input {...getInputProps()} />

          <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
            <Upload className="h-8 w-8 text-primary-600" />
          </div>

          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            {isDragActive ? 'Drop your file here' : 'Upload your document'}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Drag and drop your file, or click to browse
          </p>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Supported: PDF, PNG, JPG, JPEG (max {formatFileSize(maxSize)})
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {formatFileSize(selectedFile.size)}
              </p>

              {isProcessing && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Processing... {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {!isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
