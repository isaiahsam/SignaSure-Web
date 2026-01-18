'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import {
  getDocuments,
  getFavoriteDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/firebase';
import { Document, DocumentType, DocumentAnalysis } from '@/types';

export function useDocuments() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['documents', user?.uid],
    queryFn: () => (user ? getDocuments(user.uid) : Promise.resolve([])),
    enabled: !!user,
  });
}

export function useFavoriteDocuments() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['documents', 'favorites', user?.uid],
    queryFn: () => (user ? getFavoriteDocuments(user.uid) : Promise.resolve([])),
    enabled: !!user,
  });
}

export function useDocument(documentId: string | null) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['document', documentId, user?.uid],
    queryFn: () =>
      user && documentId ? getDocument(user.uid, documentId) : Promise.resolve(null),
    enabled: !!user && !!documentId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      fileName: string;
      type: DocumentType;
      extractedText?: string;
      analysis?: DocumentAnalysis;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return createDocument(user.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      documentId,
      data,
    }: {
      documentId: string;
      data: Partial<{
        customTitle: string | null;
        isFavorite: boolean;
        analysis: DocumentAnalysis;
      }>;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return updateDocument(user.uid, documentId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (documentId: string) => {
      if (!user) throw new Error('User not authenticated');
      return deleteDocument(user.uid, documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
