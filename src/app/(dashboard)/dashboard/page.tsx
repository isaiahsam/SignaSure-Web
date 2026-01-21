'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentCard } from '@/components/documents/document-card';
import { SkeletonList } from '@/components/ui/skeleton';
import {
  FileText,
  Upload,
  Zap,
  Star,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: documents, isLoading: isLoadingDocs } = useDocuments({ limitCount: 5 });
  const { data: favorites, isLoading: isLoadingFavs } = useDocuments({
    favoritesOnly: true,
    limitCount: 3,
  });
  const { remainingAnalyses, dailyLimit, currentCount } = useRateLimit();

  const stats = [
    {
      title: 'Documents Analyzed',
      value: documents?.length ?? 0,
      icon: FileText,
      color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
    },
    {
      title: 'Analyses Today',
      value: currentCount,
      icon: Clock,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    },
    {
      title: 'Remaining Today',
      value: remainingAnalyses,
      icon: Zap,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    },
    {
      title: 'Favorites',
      value: favorites?.length ?? 0,
      icon: Star,
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {user?.displayName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Upload a document to get started with AI-powered analysis.
          </p>
        </div>

        <Link href="/upload">
          <Button leftIcon={<Upload className="h-4 w-4" />}>
            Upload Document
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rate Limit Banner */}
      {remainingAnalyses <= 3 && remainingAnalyses > 0 && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 flex items-center gap-4">
            <Zap className="h-6 w-6 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                {remainingAnalyses} analyses remaining today
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Your daily limit resets at midnight.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {remainingAnalyses === 0 && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-4">
            <Zap className="h-6 w-6 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-200">
                Daily limit reached
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                You&apos;ve used all {dailyLimit} analyses for today. Your limit resets at midnight.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Documents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-500" />
                Recent Documents
              </CardTitle>
              <Link href="/history">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingDocs ? (
                <SkeletonList count={3} />
              ) : documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    No documents yet
                  </p>
                  <Link href="/upload">
                    <Button variant="outline" size="sm">
                      Upload Your First Document
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Favorites */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFavs ? (
                <SkeletonList count={2} />
              ) : favorites && favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Star className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Star documents to add them to your favorites
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
