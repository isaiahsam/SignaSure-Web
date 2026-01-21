'use client';

import { useState, useMemo } from 'react';
import { useDocuments, useUpdateDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DocumentCard } from '@/components/documents/document-card';
import { SkeletonList } from '@/components/ui/skeleton';
import { DOCUMENT_TYPE_LABELS, DocumentType } from '@/types';
import { Search, FileText, SlidersHorizontal } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'name';
type FilterOption = 'all' | 'favorites' | DocumentType;

export default function HistoryPage() {
  const { data: documents, isLoading } = useDocuments();
  const { addToast } = useToast();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleToggleFavorite = async (documentId: string) => {
    const doc = documents?.find((d) => d.id === documentId);
    if (!doc) return;

    try {
      await updateDocument.mutateAsync({
        documentId,
        input: { isFavorite: !doc.isFavorite },
      });
      addToast({
        type: 'success',
        title: doc.isFavorite ? 'Removed from favorites' : 'Added to favorites',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to update',
      });
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument.mutateAsync(documentId);
      addToast({
        type: 'success',
        title: 'Document deleted',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to delete document',
      });
    }
  };

  const filteredAndSortedDocuments = useMemo(() => {
    if (!documents) return [];

    let result = [...documents];

    // Filter
    if (filterBy === 'favorites') {
      result = result.filter((d) => d.isFavorite);
    } else if (filterBy !== 'all') {
      result = result.filter((d) => d.documentType === filterBy);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((d) =>
        d.fileName.toLowerCase().includes(query)
      );
    }

    // Sort
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
    { value: 'favorites', label: 'Favorites Only' },
    ...Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name (A-Z)' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Document History
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View and manage all your analyzed documents
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
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
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 animate-fade-in">
            <div className="flex-1">
              <Select
                label="Filter by"
                value={filterBy}
                onChange={(val) => setFilterBy(val as FilterOption)}
                options={filterOptions}
              />
            </div>
            <div className="flex-1">
              <Select
                label="Sort by"
                value={sortBy}
                onChange={(val) => setSortBy(val as SortOption)}
                options={sortOptions}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {!isLoading && documents && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredAndSortedDocuments.length} of {documents.length} documents
        </p>
      )}

      {/* Documents List */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : filteredAndSortedDocuments.length > 0 ? (
        <div className="space-y-3">
          {filteredAndSortedDocuments.map((doc) => (
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
              {searchQuery || filterBy !== 'all'
                ? 'No documents match your filters'
                : 'No documents yet'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchQuery || filterBy !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
