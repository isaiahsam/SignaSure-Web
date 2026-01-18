'use client';

import { useState, useMemo } from 'react';
import { useDocuments, useUpdateDocument, useDeleteDocument } from '@/hooks';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Input, Select } from '@/components/ui';
import { DocumentCardSkeleton } from '@/components/ui';
import { DocumentCard } from '@/components/documents';
import { DocumentType, getDocumentDisplayTitle } from '@/types';
import { FileText, Search, Filter } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'risk-high' | 'risk-low';
type FilterOption = 'all' | 'favorites' | DocumentType;

export default function HistoryPage() {
  const { data: documents, isLoading } = useDocuments();
  const { mutate: updateDoc } = useUpdateDocument();
  const { mutate: deleteDoc } = useDeleteDocument();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const filteredAndSortedDocuments = useMemo(() => {
    if (!documents) return [];

    let filtered = [...documents];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) =>
        getDocumentDisplayTitle(doc).toLowerCase().includes(query)
      );
    }

    // Apply type/favorites filter
    if (filterBy === 'favorites') {
      filtered = filtered.filter((doc) => doc.isFavorite);
    } else if (filterBy !== 'all') {
      filtered = filtered.filter((doc) => doc.type === filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.uploadDate.getTime() - a.uploadDate.getTime();
        case 'oldest':
          return a.uploadDate.getTime() - b.uploadDate.getTime();
        case 'risk-high':
          return (b.analysis?.riskScore ?? 0) - (a.analysis?.riskScore ?? 0);
        case 'risk-low':
          return (a.analysis?.riskScore ?? 0) - (b.analysis?.riskScore ?? 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, sortBy, filterBy]);

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
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Document History
        </h1>
        <p className="mt-1 text-gray-600 dark:text-slate-400">
          View and manage all your analyzed documents
        </p>
      </div>

      {/* Filters */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors duration-200" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="w-40 transition-all duration-200"
                >
                  <option value="all">All Types</option>
                  <option value="favorites">Favorites Only</option>
                  <option value={DocumentType.contract}>Contracts</option>
                  <option value={DocumentType.lease}>Leases</option>
                  <option value={DocumentType.loan}>Loans</option>
                  <option value={DocumentType.insurance}>Insurance</option>
                  <option value={DocumentType.employment}>Employment</option>
                  <option value={DocumentType.other}>Other</option>
                </Select>
              </div>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-36 transition-all duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="risk-high">Highest Risk</option>
                <option value="risk-low">Lowest Risk</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <CardHeader>
          <CardTitle>
            {isLoading
              ? 'Loading...'
              : `${filteredAndSortedDocuments.length} Document${
                  filteredAndSortedDocuments.length !== 1 ? 's' : ''
                }`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
            </div>
          ) : filteredAndSortedDocuments.length === 0 ? (
            <div className="py-12 text-center animate-fade-in">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-slate-400">
                {searchQuery || filterBy !== 'all'
                  ? 'No documents match your filters'
                  : 'No documents yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className="opacity-0 animate-slide-in-right"
                  style={{ animationDelay: `${0.05 * index}s`, animationFillMode: 'forwards' }}
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
