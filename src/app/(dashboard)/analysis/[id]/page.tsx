'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDocument, useAnalysis, useUpdateDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentViewer } from '@/components/analysis/document-viewer';
import { ResultsPanel } from '@/components/analysis/results-panel';
import { FlagsTab } from '@/components/analysis/flags-tab';
import { ClausesTab } from '@/components/analysis/clauses-tab';
import { DOCUMENT_TYPE_LABELS } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Star,
  Trash2,
  FileText,
  AlertTriangle,
  FileCheck,
  BarChart3,
  Loader2,
  RefreshCw,
} from 'lucide-react';

type TabType = 'analysis' | 'flags' | 'clauses';

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const documentId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: document, isLoading: isLoadingDoc, isFetching: isFetchingDoc, refetch: refetchDocument } = useDocument(documentId);
  const { data: analysis, isLoading: isLoadingAnalysis, isFetching: isFetchingAnalysis, refetch: refetchAnalysis } = useAnalysis(
    document?.analysisId
  );
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  // Refresh data when page loads - ensures we get fresh data from Firestore
  useEffect(() => {
    if (documentId && user) {
      // Invalidate and refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['document', user.uid, documentId] });
    }
  }, [documentId, user, queryClient]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchDocument();
      if (document?.analysisId) {
        await refetchAnalysis();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!document) return;

    try {
      await updateDocument.mutateAsync({
        documentId: document.id,
        input: { isFavorite: !document.isFavorite },
      });
      addToast({
        type: 'success',
        title: document.isFavorite ? 'Removed from favorites' : 'Added to favorites',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to update favorite status',
      });
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    if (!confirm('Are you sure you want to delete this document and its analysis?')) {
      return;
    }

    try {
      await deleteDocument.mutateAsync(document.id);
      addToast({
        type: 'success',
        title: 'Document deleted',
      });
      router.push('/dashboard');
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to delete document',
      });
    }
  };

  // Show loading while:
  // 1. Document is loading or fetching
  // 2. Analysis is loading or fetching (when we have an analysisId)
  // 3. Document has an analysisId but we don't have analysis data yet (covers race conditions)
  const isLoading = isLoadingDoc || isFetchingDoc || isLoadingAnalysis || isFetchingAnalysis || (document?.analysisId && !analysis);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 180px)' }}>
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading analysis...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Document Not Found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              The document you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Analysis Not Available
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {document?.analysisId
                ? 'The analysis data could not be loaded. It may still be processing.'
                : 'This document hasn\'t been analyzed yet.'}
            </p>
            {document?.analysisId && (
              <p className="text-xs text-slate-400 mb-4">
                Analysis ID: {document.analysisId}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                leftIcon={isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              >
                {isRefreshing ? 'Refreshing...' : 'Try Again'}
              </Button>
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Build analysis result object for ResultsPanel
  const analysisResult = {
    riskScore: analysis.riskScore,
    summary: analysis.summary,
    flags: analysis.flags,
    recommendations: analysis.recommendations,
    fairnessAssessment: analysis.fairnessAssessment,
    assumedUserRole: analysis.assumedUserRole,
    verdict: analysis.verdict,
    riskBreakdown: analysis.riskBreakdown,
    clarifyChecklist: analysis.clarifyChecklist,
    philippinesNotes: analysis.philippinesNotes,
    disclaimer: analysis.disclaimer,
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'flags', label: 'Flags', icon: <AlertTriangle className="h-4 w-4" />, count: analysis.flags.length },
    { id: 'clauses', label: 'Clauses', icon: <FileCheck className="h-4 w-4" />, count: analysis.importantClauses.length },
  ];

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Header - Compact */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 shrink-0">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            {document.fileName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{DOCUMENT_TYPE_LABELS[document.documentType]}</span>
            <span>•</span>
            <span>{formatDate(document.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            leftIcon={
              <Star
                className={`h-4 w-4 ${
                  document.isFavorite
                    ? 'fill-yellow-400 text-yellow-400'
                    : ''
                }`}
              />
            }
          >
            {document.isFavorite ? 'Favorited' : 'Favorite'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Split Layout: Document Viewer (LEFT) + Analysis Panel (RIGHT, fills rest) */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Document Viewer - Fixed width on desktop (LEFT side) */}
        <div className="w-full lg:w-[450px] lg:shrink-0 h-[400px] lg:h-full">
          <DocumentViewer
            fileUrl={document.fileUrl || null}
            fileName={document.fileName}
            fileType={document.fileType}
          />
        </div>

        {/* Tabbed Results Panel - Fills remaining space (RIGHT side) */}
        <div className="flex-1 min-w-0 h-[500px] lg:h-full overflow-hidden flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          {/* Tab Navigation */}
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    'px-1.5 py-0.5 text-xs rounded-full',
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'analysis' && (
              <ResultsPanel analysis={analysisResult} />
            )}

            {activeTab === 'flags' && (
              <FlagsTab flags={analysis.flags} />
            )}

            {activeTab === 'clauses' && (
              <ClausesTab clauses={analysis.importantClauses} />
            )}

            {/* Disclaimer */}
            <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong>Disclaimer:</strong> This analysis is provided for informational
                purposes only and does not constitute legal advice. Always consult with
                a qualified attorney before signing any legal document.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
