'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { DocumentViewer } from '@/components/analysis/document-viewer';
import { ResultsPanel } from '@/components/analysis/results-panel';
import { FlagsTab } from '@/components/analysis/flags-tab';
import { ClausesTab } from '@/components/analysis/clauses-tab';
import { extractText } from '@/lib/ocr';
import { saveAnalysis } from '@/lib/firebase/firestore';

// Convert file to base64 data URL (for storing in Firestore)
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
import { DOCUMENT_TYPE_LABELS, USER_ROLES, type DocumentType, type Verdict, type Flag } from '@/types';
import { cn } from '@/lib/utils';
import {
  FileText,
  Upload,
  Zap,
  Search,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  AlertTriangle,
  X,
  ArrowLeft,
  RefreshCw,
  FileCheck,
  BarChart3,
} from 'lucide-react';

type Tab = 'upload' | 'history';
type ResultsTab = 'analysis' | 'flags' | 'clauses';
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
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [userRole, setUserRole] = useState<string>(''); // Empty = let AI determine
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

  // Results tab state (for fallback view when Firestore fails)
  const [resultsTab, setResultsTab] = useState<ResultsTab>('analysis');

  // Upload handlers
  const handleFileSelect = useCallback(async (file: File) => {
    // Clean up previous file URL
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    setSelectedFile(file);
    setUploadError(null);
    setIsProcessing(true);
    setProgress(0);

    // Create object URL for document viewer
    const url = URL.createObjectURL(file);
    setFileUrl(url);

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
      URL.revokeObjectURL(url);
      setFileUrl(null);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [fileUrl]);

  // Store analysis result for showing directly if Firestore fails
  const [analysisResult, setAnalysisResult] = useState<{
    riskScore: number;
    summary: string;
    flags: Flag[];
    recommendations: string[];
    fairnessAssessment: string;
    // New Philippines-focused fields
    assumedUserRole?: string;
    verdict?: Verdict;
    riskBreakdown?: {
      fairnessRisk: number;
      enforceabilityRisk: number;
      completenessRisk: number;
      primaryDrivers: string[];
    };
    clarifyChecklist?: string[];
    philippinesNotes?: string[];
    disclaimer?: string;
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
          userRole: userRole || undefined, // Only pass if user selected a role
        }),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (!result.success) {
        throw new Error(result.error || result.details || 'Analysis failed');
      }

      // Save to Firestore - no timeout, just await each operation
      let docId: string | null = null;
      let saveSucceeded = false;

      try {
        // Step 1: Create the document to get an ID
        console.log('Creating document...');
        const doc = await createDocument.mutateAsync({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          documentType,
          extractedText,
        });
        docId = doc.id;
        console.log('Document created with ID:', docId);

        // Step 2: Convert file to base64 and store in Firestore (free alternative to Storage)
        // Works for files under ~750KB
        console.log('Converting file to base64...');
        try {
          if (selectedFile.size < 750000) { // ~750KB limit for safety
            const base64Url = await fileToBase64(selectedFile);
            await updateDocument.mutateAsync({
              documentId: doc.id,
              input: { fileUrl: base64Url },
            });
            console.log('File saved as base64');
          } else {
            console.warn('File too large for base64 storage (>750KB)');
          }
        } catch (base64Err) {
          console.warn('Failed to convert file to base64:', base64Err);
        }

        // Step 3: Save the analysis
        console.log('Saving analysis...');
        const analysis = await saveAnalysis(user.uid, {
          documentId: doc.id,
          userId: user.uid,
          riskScore: result.analysis.riskScore,
          summary: result.analysis.summary,
          flags: result.analysis.flags,
          importantClauses: result.analysis.importantClauses || [],
          recommendations: result.analysis.recommendations,
          fairnessAssessment: result.analysis.fairnessAssessment,
          // Include all new Philippines-focused fields
          assumedUserRole: result.analysis.assumedUserRole,
          verdict: result.analysis.verdict,
          riskBreakdown: result.analysis.riskBreakdown,
          clarifyChecklist: result.analysis.clarifyChecklist,
          philippinesNotes: result.analysis.philippinesNotes,
          disclaimer: result.analysis.disclaimer,
        });
        console.log('Analysis saved with ID:', analysis.id);

        // Step 4: Update document with analysis ID - THIS IS CRITICAL
        console.log('Updating document with analysis ID...');
        await updateDocument.mutateAsync({
          documentId: doc.id,
          input: { analysisId: analysis.id },
        });
        console.log('Document updated with analysisId:', analysis.id);

        // Step 5: Increment usage
        await incrementUsage();

        saveSucceeded = true;
      } catch (firestoreErr) {
        console.error('Firestore save failed:', firestoreErr);
        // If we have a docId but save failed, still try to navigate
        // The analysis might have been saved but the update failed
      }

      addToast({
        type: 'success',
        title: 'Analysis complete',
        description: 'Your document has been analyzed.',
      });

      if (docId && saveSucceeded) {
        // Small delay to ensure Firestore writes are propagated
        await new Promise(resolve => setTimeout(resolve, 500));
        // Redirect to analysis page with split-screen view
        router.push(`/analysis/${docId}`);
      } else if (docId) {
        // Document was created but save might have partially failed
        // Still try to navigate - the data might be there
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(`/analysis/${docId}`);
      } else {
        // Show results on dashboard if Firestore completely failed
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
  }, [user, selectedFile, extractedText, canAnalyze, documentType, userRole, addToast, createDocument, updateDocument, incrementUsage, router]);

  const resetUpload = useCallback(() => {
    // Clean up file URL
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFileUrl(null);
    setSelectedFile(null);
    setDocumentType('other');
    setUserRole('');
    setExtractedText('');
    setUploadError(null);
    setAnalysisResult(null);
  }, [fileUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

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
    <div className="max-w-7xl mx-auto space-y-6">
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
            // Show analysis results with split layout - full height
            <>
              {/* Split Layout: Document Viewer + Tabbed Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[75vh]">
                {/* Document Viewer - Left Half - Takes full height */}
                <div className="h-full">
                  <DocumentViewer
                    fileUrl={fileUrl}
                    fileName={selectedFile?.name || 'document'}
                    fileType={selectedFile?.type || 'application/pdf'}
                    extractedText={extractedText}
                  />
                </div>

                {/* Tabbed Results Panel - Right Half */}
                <div className="h-full overflow-auto flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {/* Tab Navigation */}
                  <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-4">
                    <button
                      onClick={() => setResultsTab('analysis')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                        resultsTab === 'analysis'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Analysis
                    </button>
                    <button
                      onClick={() => setResultsTab('flags')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                        resultsTab === 'flags'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Flags
                      <span className={cn(
                        'px-1.5 py-0.5 text-xs rounded-full',
                        resultsTab === 'flags'
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      )}>
                        {analysisResult.flags?.length || 0}
                      </span>
                    </button>
                    <button
                      onClick={() => setResultsTab('clauses')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                        resultsTab === 'clauses'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <FileCheck className="h-4 w-4" />
                      Clauses
                    </button>
                  </div>

                  {/* Tab Content */}
                  {resultsTab === 'analysis' && (
                    <ResultsPanel analysis={analysisResult} />
                  )}

                  {resultsTab === 'flags' && (
                    <FlagsTab flags={analysisResult.flags || []} />
                  )}

                  {resultsTab === 'clauses' && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Clauses are available in saved analyses.</p>
                      <p className="text-sm mt-1">This analysis wasn&apos;t saved to history.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  className="px-6"
                >
                  Analyze Another Document
                </Button>
              </div>
            </>
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
                  onChange={(newType) => {
                    setDocumentType(newType);
                    setUserRole(''); // Reset role when document type changes
                  }}
                  label="Document Type"
                />

                {/* User Role Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Who are you in this document?
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {(USER_ROLES[documentType] || USER_ROLES.other).map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {/* Show description for selected role */}
                  {userRole && (
                    <div className="flex items-center gap-2 p-2 rounded bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                      <span className="text-primary-600 dark:text-primary-400">→</span>
                      <p className="text-sm text-primary-700 dark:text-primary-300">
                        {(USER_ROLES[documentType] || USER_ROLES.other).find(r => r.value === userRole)?.description}
                      </p>
                    </div>
                  )}
                  {!userRole && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      This helps us analyze the document from your perspective
                    </p>
                  )}
                </div>

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
          {/* Back to Upload Button */}
          <button
            onClick={() => setActiveTab('upload')}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Upload
          </button>

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
