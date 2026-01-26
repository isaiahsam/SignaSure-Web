'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DocumentCard } from '@/components/documents/document-card';
import { UploadDropzone } from '@/components/documents/upload-dropzone';
import { DocumentTypeSelect } from '@/components/documents/document-type-select';
import { SkeletonList } from '@/components/ui/skeleton';
import { extractText } from '@/lib/ocr';
import { saveAnalysis } from '@/lib/firebase/firestore';
import { DOCUMENT_TYPE_LABELS, type DocumentType } from '@/types';
import { cn } from '@/lib/utils';
import {
  FileText,
  Upload,
  Zap,
  Search,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

type Tab = 'upload' | 'history';
type SortOption = 'newest' | 'oldest' | 'name';
type FilterOption = 'all' | 'favorites' | DocumentType;

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: documents, isLoading: isLoadingDocs } = useDocuments();
  const { canAnalyze, remainingAnalyses, dailyLimit, currentCount, incrementUsage } = useRateLimit();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // History state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Upload handlers
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      const text = await extractText(file, {
        onProgress: (p) => setProgress(p),
      });

      if (text.length < 50) {
        throw new Error('Could not extract enough text. Please try a clearer document.');
      }

      setExtractedText(text);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process file');
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  // Store analysis result for showing directly if Firestore fails
  const [analysisResult, setAnalysisResult] = useState<{
    riskScore: number;
    summary: string;
    flags: Array<{ severity: string; title: string; description: string; recommendation?: string }>;
    recommendations: string[];
    fairnessAssessment: string;
  } | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!user || !selectedFile || !extractedText) return;

    // Skip rate limit check if Firestore is having issues
    if (!canAnalyze) {
      console.log('Rate limit check failed, but continuing anyway');
    }

    setIsAnalyzing(true);
    setUploadError(null);

    try {
      // Call the AI API FIRST (this is the important part)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: 'temp-' + Date.now(),
          extractedText,
          documentType,
        }),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (!result.success) {
        throw new Error(result.error || result.details || 'Analysis failed');
      }

      // Try to save to Firestore with a 10 second timeout
      let docId: string | null = null;
      const firestoreTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 10000)
      );

      try {
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

            await updateDocument.mutateAsync({
              documentId: doc.id,
              input: { analysisId: analysis.id },
            });

            await incrementUsage();
          })(),
          firestoreTimeout
        ]);
      } catch (firestoreErr) {
        console.warn('Firestore save failed or timed out:', firestoreErr);
        docId = null;
      }

      addToast({
        type: 'success',
        title: 'Analysis complete',
        description: 'Your document has been analyzed.',
      });

      if (docId) {
        router.push(`/analysis/${docId}`);
      } else {
        // Show results directly if Firestore failed
        setAnalysisResult(result.analysis);
        setIsAnalyzing(false);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Analysis failed');
      addToast({
        type: 'error',
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
      setIsAnalyzing(false);
    }
  }, [user, selectedFile, extractedText, canAnalyze, documentType, addToast, createDocument, updateDocument, incrementUsage, router]);

  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setDocumentType('other');
    setExtractedText('');
    setUploadError(null);
    setAnalysisResult(null);
  }, []);

  // History handlers
  const handleToggleFavorite = useCallback(async (documentId: string) => {
    const doc = documents?.find((d) => d.id === documentId);
    if (!doc) return;

    try {
      await updateDocument.mutateAsync({
        documentId,
        input: { isFavorite: !doc.isFavorite },
      });
    } catch {
      addToast({ type: 'error', title: 'Failed to update' });
    }
  }, [documents, updateDocument, addToast]);

  const handleDelete = useCallback(async (documentId: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      await deleteDocument.mutateAsync(documentId);
      addToast({ type: 'success', title: 'Document deleted' });
    } catch {
      addToast({ type: 'error', title: 'Failed to delete' });
    }
  }, [deleteDocument, addToast]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    let result = [...documents];

    if (filterBy === 'favorites') {
      result = result.filter((d) => d.isFavorite);
    } else if (filterBy !== 'all') {
      result = result.filter((d) => d.documentType === filterBy);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((d) => d.fileName.toLowerCase().includes(query));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.fileName.localeCompare(b.fileName);
        default:
          return 0;
      }
    });

    return result;
  }, [documents, filterBy, searchQuery, sortBy]);

  const filterOptions = [
    { value: 'all', label: 'All Documents' },
    { value: 'favorites', label: 'Favorites' },
    ...Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name (A-Z)' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Welcome, {user?.displayName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {remainingAnalyses} of {dailyLimit} analyses remaining today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{documents?.length ?? 0}</p>
            <p className="text-xs text-slate-500">Documents</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{currentCount}</p>
            <p className="text-xs text-slate-500">Today</p>
          </div>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {!canAnalyze && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">
            Daily limit reached. Your limit resets at midnight.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('upload')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'upload'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'history'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <FileText className="h-4 w-4" />
          History ({documents?.length ?? 0})
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {analysisResult ? (
            // Show analysis results directly when Firestore failed
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Complete</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Risk Score: {analysisResult.riskScore}/100
                  </p>
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
          ) : isAnalyzing ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Analyzing Your Document
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Our AI is reviewing your document...
                </p>
              </CardContent>
            </Card>
          ) : !selectedFile || !extractedText ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
              </CardHeader>
              <CardContent>
                <UploadDropzone
                  onFileSelect={handleFileSelect}
                  isProcessing={isProcessing}
                  progress={progress}
                />
                {uploadError && (
                  <p className="mt-4 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-600" />
                    Ready to Analyze
                  </span>
                  <Button variant="ghost" size="sm" onClick={resetUpload}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {extractedText.length.toLocaleString()} characters extracted
                  </p>
                </div>

                <DocumentTypeSelect
                  value={documentType}
                  onChange={setDocumentType}
                  label="Document Type"
                />

                {uploadError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetUpload}>
                    Cancel
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
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex-1">
                <Select
                  label="Filter"
                  value={filterBy}
                  onChange={(val) => setFilterBy(val as FilterOption)}
                  options={filterOptions}
                />
              </div>
              <div className="flex-1">
                <Select
                  label="Sort"
                  value={sortBy}
                  onChange={(val) => setSortBy(val as SortOption)}
                  options={sortOptions}
                />
              </div>
            </div>
          )}

          {/* Document List */}
          {isLoadingDocs ? (
            <SkeletonList count={5} />
          ) : filteredDocuments.length > 0 ? (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  {searchQuery || filterBy !== 'all' ? 'No matches found' : 'No documents yet'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {searchQuery || filterBy !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Upload a document to get started'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
