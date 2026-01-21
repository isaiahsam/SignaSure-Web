'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCreateDocument, useUpdateDocument } from '@/hooks/useDocuments';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadDropzone } from '@/components/documents/upload-dropzone';
import { DocumentTypeSelect } from '@/components/documents/document-type-select';
import { extractText } from '@/lib/ocr';
import { saveAnalysis } from '@/lib/firebase/firestore';
import type { DocumentType, DocumentAnalysis } from '@/types';
import { FileText, Zap, AlertCircle, Loader2 } from 'lucide-react';

type UploadStep = 'upload' | 'configure' | 'analyzing' | 'complete';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { canAnalyze, remainingAnalyses, incrementUsage } = useRateLimit();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();

  const [step, setStep] = useState<UploadStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      const text = await extractText(file, {
        onProgress: (p) => setProgress(p),
      });

      if (text.length < 50) {
        throw new Error('Could not extract enough text from the document. Please try a clearer image or PDF.');
      }

      setExtractedText(text);
      setStep('configure');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleAnalyze = async () => {
    if (!user || !selectedFile || !extractedText) return;

    if (!canAnalyze) {
      addToast({
        type: 'error',
        title: 'Daily limit reached',
        description: 'You have used all your analyses for today.',
      });
      return;
    }

    setStep('analyzing');
    setError(null);

    try {
      // Create the document record
      const doc = await createDocument.mutateAsync({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        documentType,
        extractedText,
      });

      // Call the analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          extractedText,
          documentType,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Save the analysis to Firestore
      const analysis = await saveAnalysis(user.uid, {
        documentId: doc.id,
        userId: user.uid,
        riskScore: result.analysis.riskScore,
        summary: result.analysis.summary,
        flags: result.analysis.flags,
        importantClauses: result.analysis.importantClauses,
        recommendations: result.analysis.recommendations,
        fairnessAssessment: result.analysis.fairnessAssessment,
      });

      // Update the document with the analysis ID
      await updateDocument.mutateAsync({
        documentId: doc.id,
        input: { analysisId: analysis.id },
      });

      // Increment usage
      await incrementUsage();

      addToast({
        type: 'success',
        title: 'Analysis complete',
        description: 'Your document has been analyzed successfully.',
      });

      // Navigate to the analysis page
      router.push(`/analysis/${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStep('configure');
      addToast({
        type: 'error',
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const resetUpload = () => {
    setStep('upload');
    setSelectedFile(null);
    setDocumentType('other');
    setExtractedText('');
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Upload Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Upload a legal document for AI-powered analysis
        </p>
      </div>

      {/* Rate limit warning */}
      {!canAnalyze && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Daily limit reached
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                You&apos;ve used all your analyses for today. Your limit resets at midnight.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {remainingAnalyses > 0 && remainingAnalyses <= 3 && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 flex items-center gap-4">
            <Zap className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {remainingAnalyses} analysis{remainingAnalyses !== 1 ? 'es' : ''} remaining today
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upload Step */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Document</CardTitle>
            <CardDescription>
              Upload a PDF or image of your contract, lease, or legal document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadDropzone
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
              progress={progress}
            />
            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configure Step */}
      {step === 'configure' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Configure Analysis
            </CardTitle>
            <CardDescription>
              {selectedFile?.name} - Text extracted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DocumentTypeSelect
              value={documentType}
              onChange={setDocumentType}
              label="What type of document is this?"
            />

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Text preview ({extractedText.length.toLocaleString()} characters):
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-3">
                {extractedText.slice(0, 500)}...
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetUpload}>
                Upload Different File
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                leftIcon={<Zap className="h-4 w-4" />}
              >
                Analyze Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyzing Step */}
      {step === 'analyzing' && (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Analyzing Your Document
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Our AI is reading through your document, identifying risks, and
              preparing a detailed analysis. This usually takes 15-30 seconds.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
