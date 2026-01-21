import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Document,
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentAnalysis,
} from '@/types';

// Helper to convert Firestore timestamps to Date
function convertTimestamps<T extends DocumentData>(data: T): T {
  const converted = { ...data } as Record<string, unknown>;
  for (const key in converted) {
    const value = converted[key];
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    }
  }
  return converted as T;
}

// User operations
export async function createUserProfile(
  userId: string,
  data: { email: string; displayName: string; photoURL?: string }
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', userId);
  await setDoc(
    userRef,
    {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export async function getUserProfile(userId: string): Promise<DocumentData | null> {
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return null;
  return convertTimestamps(snapshot.data());
}

// Document operations
export async function createDocument(
  userId: string,
  input: CreateDocumentInput
): Promise<Document> {
  if (!db) throw new Error('Firestore not initialized');

  const docRef = doc(collection(db, 'users', userId, 'documents'));
  const now = Timestamp.now();

  const documentData = {
    ...input,
    userId,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, documentData);

  return {
    id: docRef.id,
    ...input,
    userId,
    isFavorite: false,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
}

export async function getDocument(
  userId: string,
  documentId: string
): Promise<Document | null> {
  if (!db) throw new Error('Firestore not initialized');

  const docRef = doc(db, 'users', userId, 'documents', documentId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = convertTimestamps(snapshot.data());
  return {
    id: snapshot.id,
    ...data,
  } as Document;
}

export async function getDocuments(
  userId: string,
  options?: {
    limitCount?: number;
    favoritesOnly?: boolean;
  }
): Promise<Document[]> {
  if (!db) throw new Error('Firestore not initialized');

  const docsRef = collection(db, 'users', userId, 'documents');
  let q = query(docsRef, orderBy('createdAt', 'desc'));

  if (options?.favoritesOnly) {
    q = query(docsRef, where('isFavorite', '==', true), orderBy('createdAt', 'desc'));
  }

  if (options?.limitCount) {
    q = query(q, limit(options.limitCount));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = convertTimestamps(doc.data());
    return {
      id: doc.id,
      ...data,
    } as Document;
  });
}

export async function updateDocument(
  userId: string,
  documentId: string,
  input: UpdateDocumentInput
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const docRef = doc(db, 'users', userId, 'documents', documentId);
  await updateDoc(docRef, {
    ...input,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteDocument(userId: string, documentId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const docRef = doc(db, 'users', userId, 'documents', documentId);
  await deleteDoc(docRef);
}

// Analysis operations
export async function saveAnalysis(
  userId: string,
  analysis: Omit<DocumentAnalysis, 'id' | 'createdAt'>
): Promise<DocumentAnalysis> {
  if (!db) throw new Error('Firestore not initialized');

  const analysisRef = doc(collection(db, 'users', userId, 'analyses'));
  const now = Timestamp.now();

  const analysisData = {
    ...analysis,
    createdAt: now,
  };

  await setDoc(analysisRef, analysisData);

  return {
    id: analysisRef.id,
    ...analysis,
    createdAt: now.toDate(),
  };
}

export async function getAnalysis(
  userId: string,
  analysisId: string
): Promise<DocumentAnalysis | null> {
  if (!db) throw new Error('Firestore not initialized');

  const analysisRef = doc(db, 'users', userId, 'analyses', analysisId);
  const snapshot = await getDoc(analysisRef);

  if (!snapshot.exists()) return null;

  const data = convertTimestamps(snapshot.data());
  return {
    id: snapshot.id,
    ...data,
  } as DocumentAnalysis;
}

// Usage tracking
export interface UsageData {
  date: string;
  analysisCount: number;
  lastAnalysisAt?: Date;
}

export async function getUsageData(userId: string): Promise<UsageData | null> {
  if (!db) throw new Error('Firestore not initialized');

  const today = new Date().toISOString().split('T')[0];
  const usageRef = doc(db, 'users', userId, 'usage', today);
  const snapshot = await getDoc(usageRef);

  if (!snapshot.exists()) return null;

  const data = convertTimestamps(snapshot.data());
  return data as UsageData;
}

export async function incrementUsage(userId: string): Promise<UsageData> {
  if (!db) throw new Error('Firestore not initialized');

  const today = new Date().toISOString().split('T')[0];
  const usageRef = doc(db, 'users', userId, 'usage', today);
  const snapshot = await getDoc(usageRef);

  let newCount = 1;
  if (snapshot.exists()) {
    newCount = (snapshot.data().analysisCount || 0) + 1;
  }

  const usageData = {
    date: today,
    analysisCount: newCount,
    lastAnalysisAt: Timestamp.now(),
  };

  await setDoc(usageRef, usageData);

  return {
    ...usageData,
    lastAnalysisAt: new Date(),
  };
}
