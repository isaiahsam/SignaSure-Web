'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDocument, useUpdateDocument } from '@/hooks';
import { useToast } from '@/components/ui/toast';
import { Button, Skeleton } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { RiskScoreCard } from '@/components/analysis';
import { FlagsTab } from '@/components/analysis';
import { ClausesTab } from '@/components/analysis';
import { SummaryCard } from '@/components/analysis';
import { formatDate } from '@/lib/utils';
import { getDocumentDisplayTitle } from '@/types';
import {
  ArrowLeft,
  Star,
  FileText,
  Flag,
  Gavel,
  FileCheck,
  CheckCircle,
} from 'lucide-react';

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const { data: document, isLoading } = useDocument(documentId);
  const { mutate: updateDoc } = useUpdateDocument();
  const { success, error } = useToast();

  const handleToggleFavorite = () => {
    if (!document) return;
    updateDoc(
      { documentId, data: { isFavorite: !document.isFavorite } },
      {
        onSuccess: () =>
          success(document.isFavorite ? 'Removed from favorites' : 'Added to favorites'),
        onError: () => error('Failed to update favorite status'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-16 w-16 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Document Not Found
        </h2>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          This document may have been deleted or doesn&apos;t exist.
        </p>
        <Link href="/dashboard">
          <Button className="mt-4">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const analysis = document.analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-fade-in-down">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getDocumentDisplayTitle(document)}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Analyzed on {formatDate(document.uploadDate)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleToggleFavorite}
            className="gap-2"
          >
            <Star
              className={`h-4 w-4 transition-transform duration-200 ${document.isFavorite ? 'scale-110' : ''}`}
              fill={document.isFavorite ? 'currentColor' : 'none'}
            />
            {document.isFavorite ? 'Favorited' : 'Add to Favorites'}
          </Button>
          <Link href="/dashboard">
            <Button className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Done
            </Button>
          </Link>
        </div>
      </div>

      {/* Risk Score */}
      {analysis && (
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <RiskScoreCard riskScore={analysis.riskScore} />
        </div>
      )}

      {/* Quick Stats */}
      {analysis && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 opacity-0 animate-fade-in-up transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Flag className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.flags.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Flags Found</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 opacity-0 animate-fade-in-up transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Gavel className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.importantClauses.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Key Clauses</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabbed Content */}
      {analysis && (
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="summary" className="gap-2 transition-all duration-200">
                <FileCheck className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="flags" className="gap-2 transition-all duration-200">
                <Flag className="h-4 w-4" />
                Flags ({analysis.flags.length})
              </TabsTrigger>
              <TabsTrigger value="clauses" className="gap-2 transition-all duration-200">
                <Gavel className="h-4 w-4" />
                Clauses ({analysis.importantClauses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="animate-fade-in">
              <SummaryCard analysis={analysis} />
            </TabsContent>

            <TabsContent value="flags" className="animate-fade-in">
              <FlagsTab flags={analysis.flags} />
            </TabsContent>

            <TabsContent value="clauses" className="animate-fade-in">
              <ClausesTab clauses={analysis.importantClauses} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
