'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getAnalysis,
} from '@/lib/firebase/firestore';
import type {
  Document,
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentAnalysis,
} from '@/types';
import { useAuth } from './useAuth';

export function useDocuments(options?: { favoritesOnly?: boolean; limitCount?: number }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['documents', user?.uid, options],
    queryFn: () => {
      if (!user) return [];
      return getDocuments(user.uid, options);
    },
    enabled: !!user,
  });
}

export function useDocument(documentId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document', user?.uid, documentId],
    queryFn: () => {
      if (!user || !documentId) return null;
      return getDocument(user.uid, documentId);
    },
    enabled: !!user && !!documentId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    retry: 3,
  });
}

export function useCreateDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDocumentInput) => {
      if (!user) throw new Error('Not authenticated');
      return createDocument(user.uid, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      input,
    }: {
      documentId: string;
      input: UpdateDocumentInput;
    }) => {
      if (!user) throw new Error('Not authenticated');
      return updateDocument(user.uid, documentId, input);
    },
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', user?.uid, documentId] });
    },
  });
}

export function useDeleteDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => {
      if (!user) throw new Error('Not authenticated');
      return deleteDocument(user.uid, documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useAnalysis(analysisId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analysis', user?.uid, analysisId],
    queryFn: async () => {
      if (!user || !analysisId) return null;
      const result = await getAnalysis(user.uid, analysisId);
      return result;
    },
    enabled: !!user && !!analysisId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000, // Wait 1 second between retries
  });
}
