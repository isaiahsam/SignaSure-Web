'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function UploadDropzone({
  onFileSelect,
  isLoading = false,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
}: UploadDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a PDF or image file.');
        } else {
          setError('Failed to upload file. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    [maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isLoading,
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300',
            isDragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02] shadow-lg'
              : 'border-gray-300 hover:border-primary-400 hover:shadow-md dark:border-slate-600 dark:hover:border-primary-500',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            'mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 transition-all duration-300',
            isDragActive && 'text-primary-500 scale-110 animate-bounce'
          )} />
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-slate-200 transition-colors duration-200">
            {isDragActive ? 'Drop your document here' : 'Drag & drop your document'}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            or click to browse
          </p>
          <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">
            Supported formats: PDF, PNG, JPG, JPEG (Max {maxSize / 1024 / 1024}MB)
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800 animate-scale-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-95"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <Button
            onClick={handleUpload}
            className="mt-4 w-full"
            isLoading={isLoading}
          >
            {isLoading ? 'Processing...' : 'Analyze Document'}
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400 animate-shake">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
