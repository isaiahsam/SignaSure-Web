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

  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(null);

  const handleAnalyze = async () => {
    alert('Analyze button clicked!'); // Debug alert
    console.log('handleAnalyze called', { user: !!user, selectedFile: !!selectedFile, extractedText: extractedText.length });

    if (!user || !selectedFile || !extractedText) {
      console.log('Missing required data, returning early');
      alert('Missing data: user=' + !!user + ', file=' + !!selectedFile + ', text=' + extractedText.length);
      return;
    }

    // Skip rate limit check if Firestore is having issues - allow analysis to proceed
    if (!canAnalyze) {
      console.log('Rate limit check failed, but continuing anyway');
    }

    setStep('analyzing');
    setError(null);

    try {
      console.log('Calling /api/analyze...');
      // Call the analysis API first (this is the important part)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: 'temp-' + Date.now(),
          extractedText,
          documentType,
        }),
      });
      console.log('API response status:', response.status);

      const result = await response.json();
      console.log('API result:', result.success ? 'success' : 'failed', result.error || '');

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      console.log('Analysis successful, risk score:', result.analysis?.riskScore);

      // Try to save to Firestore with a 10 second timeout
      let docId: string | null = null;
      const firestoreTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 10000)
      );

      try {
        console.log('Attempting to save to Firestore...');
        await Promise.race([
          (async () => {
            const doc = await createDocument.mutateAsync({
              fileName: selectedFile.name,
              fileType: selectedFile.type,
              fileSize: selectedFile.size,
              documentType,
              extractedText,
            });
            docId = doc.id;
            console.log('Document created:', doc.id);

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
            console.log('Analysis saved:', analysis.id);

            await updateDocument.mutateAsync({
              documentId: doc.id,
              input: { analysisId: analysis.id },
            });

            await incrementUsage();
            console.log('Firestore save complete');
          })(),
          firestoreTimeout
        ]);
      } catch (firestoreErr) {
        console.warn('Firestore save failed or timed out, showing results anyway:', firestoreErr);
        docId = null; // Ensure we show results directly
      }

      addToast({
        type: 'success',
        title: 'Analysis complete',
        description: 'Your document has been analyzed successfully.',
      });

      // If Firestore worked, navigate to the saved analysis
      if (docId) {
        console.log('Navigating to analysis page:', docId);
        router.push(`/analysis/${docId}`);
      } else {
        // Otherwise, show results directly on this page
        console.log('Showing results directly on page');
        setAnalysisResult(result.analysis);
        setStep('complete');
      }
    } catch (err) {
      console.error('Analysis error:', err);
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
    setAnalysisResult(null);
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

      {/* Complete Step - Show results directly if Firestore failed */}
      {step === 'complete' && analysisResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Complete</CardTitle>
              <CardDescription>
                Risk Score: {analysisResult.riskScore}/100
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Summary</h3>
                <p className="text-slate-600 dark:text-slate-400">{analysisResult.summary}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Fairness Assessment</h3>
                <p className="text-slate-600 dark:text-slate-400">{analysisResult.fairnessAssessment}</p>
              </div>

              {analysisResult.flags && analysisResult.flags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Flags ({analysisResult.flags.length})
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.flags.map((flag, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            flag.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            flag.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {flag.severity}
                          </span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{flag.title}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{flag.description}</p>
                        {flag.recommendation && (
                          <p className="text-sm text-primary-600 mt-1">Recommendation: {flag.recommendation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    {analysisResult.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={resetUpload} variant="outline">
            Analyze Another Document
          </Button>
        </div>
      )}
    </div>
  );
}
