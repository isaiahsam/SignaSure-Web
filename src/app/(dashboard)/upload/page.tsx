'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRateLimit } from '@/hooks';
import { useCreateDocument } from '@/hooks';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { UploadDropzone } from '@/components/documents';
import { DocumentTypeSelect } from '@/components/documents';
import { DocumentType } from '@/types';
import { extractTextFromFile } from '@/lib/ocr';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { status, stats, recordUsage } = useRateLimit();
  const { mutateAsync: createDocument } = useCreateDocument();
  const { success, error: showError } = useToast();

  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.contract);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const handleFileSelect = async (file: File) => {
    if (!status.canProceed) {
      showError(status.message);
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Extract text from file
      setProcessingStep('Extracting text from document...');
      const extractedText = await extractTextFromFile(file);

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Could not extract enough text from the document. Please try a different file.');
      }

      // Step 2: Send to Gemini API for analysis
      setProcessingStep('Analyzing document with AI...');
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractedText,
          documentType,
        }),
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok || !analyzeData.success) {
        throw new Error(analyzeData.error || 'Failed to analyze document');
      }

      // Record usage
      await recordUsage();

      // Step 3: Save to Firestore
      setProcessingStep('Saving results...');
      const documentId = await createDocument({
        fileName: file.name,
        type: documentType,
        extractedText,
        analysis: analyzeData.analysis,
      });

      success('Document analyzed successfully!');
      router.push(`/analysis/${documentId}`);
    } catch (err) {
      console.error('Error processing document:', err);
      showError(err instanceof Error ? err.message : 'Failed to process document');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Upload Document
        </h1>
        <p className="mt-1 text-gray-600 dark:text-slate-400">
          Upload a PDF or image of your legal document for AI analysis
        </p>
      </div>

      {/* Rate Limit Warning */}
      {!status.canProceed && (
        <div className="flex items-start gap-3 rounded-xl border-2 border-orange-300 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20 animate-shake">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
          <div>
            <p className="font-medium text-orange-800 dark:text-orange-300">
              Rate Limit Reached
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              {status.message}
            </p>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <span className="transition-all duration-200 hover:scale-105">
          <strong className="text-gray-900 dark:text-white">{stats.remainingThisHour}</strong>{' '}
          of {stats.maxPerHour} left this hour
        </span>
        <span className="transition-all duration-200 hover:scale-105">
          <strong className="text-gray-900 dark:text-white">{stats.remainingToday}</strong>{' '}
          of {stats.maxPerDay} left today
        </span>
      </div>

      {/* Document Type Selection */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <CardHeader>
          <CardTitle>Document Type</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentTypeSelect
            value={documentType}
            onChange={setDocumentType}
            className="max-w-xs"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Selecting the correct type helps the AI provide more accurate analysis
          </p>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
              <p className="mt-4 font-medium text-gray-900 dark:text-white animate-pulse">
                {processingStep}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                This may take a moment...
              </p>
            </div>
          ) : (
            <UploadDropzone
              onFileSelect={handleFileSelect}
              isLoading={isProcessing}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
