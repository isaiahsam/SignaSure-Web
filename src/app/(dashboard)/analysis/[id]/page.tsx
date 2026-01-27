'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDocument, useAnalysis, useUpdateDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { RiskScoreCard } from '@/components/analysis/risk-score-card';
import { FlagsTab } from '@/components/analysis/flags-tab';
import { ClausesTab } from '@/components/analysis/clauses-tab';
import { SummaryCard } from '@/components/analysis/summary-card';
import { DOCUMENT_TYPE_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Star,
  Trash2,
  FileText,
  AlertTriangle,
  FileCheck,
  Info,
} from 'lucide-react';

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const documentId = params.id as string;

  const [activeTab, setActiveTab] = useState('summary');
  const [scrollToClauseId, setScrollToClauseId] = useState<string | null>(null);

  const { data: document, isLoading: isLoadingDoc } = useDocument(documentId);
  const { data: analysis, isLoading: isLoadingAnalysis } = useAnalysis(
    document?.analysisId
  );
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

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
      router.push('/history');
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to delete document',
      });
    }
  };

  const handleClauseClick = (clauseId: string) => {
    setScrollToClauseId(clauseId);
    setActiveTab('clauses');
    // Reset scroll target after navigation
    setTimeout(() => setScrollToClauseId(null), 1000);
  };

  if (isLoadingDoc || isLoadingAnalysis) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
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
            <Link href="/history">
              <Button variant="outline">View All Documents</Button>
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
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              This document hasn&apos;t been analyzed yet or the analysis is still processing.
            </p>
            <Link href="/upload">
              <Button>Upload and Analyze</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Link
            href="/history"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {document.fileName}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
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

      {/* Risk Score */}
      <RiskScoreCard score={analysis.riskScore} />

      {/* Analysis Tabs */}
      <Tabs defaultValue="summary" value={activeTab} onChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">
            <Info className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="flags">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Flags ({analysis.flags.length})
          </TabsTrigger>
          <TabsTrigger value="clauses">
            <FileCheck className="h-4 w-4 mr-2" />
            Clauses ({analysis.importantClauses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <SummaryCard
            summary={analysis.summary}
            recommendations={analysis.recommendations}
            fairnessAssessment={analysis.fairnessAssessment}
            assumedUserRole={analysis.assumedUserRole}
            verdict={analysis.verdict}
            clarifyChecklist={analysis.clarifyChecklist}
            philippinesNotes={analysis.philippinesNotes}
            disclaimer={analysis.disclaimer}
            clauses={analysis.importantClauses}
            onClauseClick={handleClauseClick}
          />
        </TabsContent>

        <TabsContent value="flags">
          <FlagsTab flags={analysis.flags} />
        </TabsContent>

        <TabsContent value="clauses">
          <ClausesTab
            clauses={analysis.importantClauses}
            scrollToClauseId={scrollToClauseId}
          />
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <CardContent className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Disclaimer:</strong> This analysis is provided for informational
            purposes only and does not constitute legal advice. Always consult with
            a qualified attorney before signing any legal document.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
