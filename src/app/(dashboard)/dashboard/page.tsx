'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks';
import { useDocuments, useFavoriteDocuments, useUpdateDocument, useDeleteDocument } from '@/hooks';
import { useRateLimit } from '@/hooks';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { DocumentCardSkeleton } from '@/components/ui';
import { DocumentCard } from '@/components/documents';
import { useToast } from '@/components/ui/toast';
import {
  Upload,
  Star,
  Clock,
  FileText,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const { data: favorites, isLoading: favsLoading } = useFavoriteDocuments();
  const { stats } = useRateLimit();
  const { mutate: updateDoc } = useUpdateDocument();
  const { mutate: deleteDoc } = useDeleteDocument();
  const { success, error } = useToast();

  const recentDocuments = documents?.slice(0, 5) || [];

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    updateDoc(
      { documentId: id, data: { isFavorite } },
      {
        onSuccess: () => success(isFavorite ? 'Added to favorites' : 'Removed from favorites'),
        onError: () => error('Failed to update favorite status'),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDoc(id, {
        onSuccess: () => success('Document deleted'),
        onError: () => error('Failed to delete document'),
      });
    }
  };

  const handleEditTitle = (id: string, title: string) => {
    updateDoc(
      { documentId: id, data: { customTitle: title } },
      {
        onSuccess: () => success('Title updated'),
        onError: () => error('Failed to update title'),
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!
          </h1>
          <p className="mt-1 text-gray-600 dark:text-slate-400">
            Upload documents to get AI-powered analysis
          </p>
        </div>
        <Link href="/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </Link>
      </div>

      {/* Usage Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30 transition-transform duration-300 hover:scale-110">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents?.length ?? 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30 transition-transform duration-300 hover:scale-110">
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {favorites?.length ?? 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30 transition-transform duration-300 hover:scale-110">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.remainingToday}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Analyses Left Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Favorites Section */}
      {(favorites?.length ?? 0) > 0 && (
        <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <DocumentCardSkeleton />
                <DocumentCardSkeleton />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {favorites?.slice(0, 4).map((doc, index) => (
                  <div
                    key={doc.id}
                    className="opacity-0 animate-scale-in"
                    style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'forwards' }}
                  >
                    <DocumentCard
                      document={doc}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDelete}
                      onEditTitle={handleEditTitle}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Documents Section */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            Recent Documents
          </CardTitle>
          {(documents?.length ?? 0) > 5 && (
            <Link
              href="/history"
              className="flex items-center gap-1 text-sm text-primary-600 hover:underline transition-all duration-200 hover:gap-2"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {docsLoading ? (
            <div className="space-y-3">
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
            </div>
          ) : recentDocuments.length === 0 ? (
            <div className="py-12 text-center animate-fade-in">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-slate-400">
                No documents yet. Upload your first document to get started.
              </p>
              <Link href="/upload">
                <Button className="mt-4 gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className="opacity-0 animate-slide-in-right"
                  style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'forwards' }}
                >
                  <DocumentCard
                    document={doc}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDelete}
                    onEditTitle={handleEditTitle}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
