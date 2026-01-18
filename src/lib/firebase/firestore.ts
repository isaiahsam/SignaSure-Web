import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Document, DocumentAnalysis, DocumentType } from '@/types';

// Document CRUD operations
export async function createDocument(
  userId: string,
  data: {
    fileName: string;
    type: DocumentType;
    extractedText?: string;
    analysis?: DocumentAnalysis;
  }
): Promise<string> {
  const docRef = await addDoc(collection(db, 'users', userId, 'documents'), {
    ...data,
    uploadDate: serverTimestamp(),
    isFavorite: false,
    customTitle: null,
  });
  return docRef.id;
}

export async function getDocument(
  userId: string,
  documentId: string
): Promise<Document | null> {
  const docRef = doc(db, 'users', userId, 'documents', documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    fileName: data.fileName,
    uploadDate: data.uploadDate instanceof Timestamp
      ? data.uploadDate.toDate()
      : new Date(data.uploadDate),
    type: data.type as DocumentType,
    extractedText: data.extractedText,
    analysis: data.analysis,
    isFavorite: data.isFavorite ?? false,
    customTitle: data.customTitle,
  };
}

export async function getDocuments(userId: string): Promise<Document[]> {
  const q = query(
    collection(db, 'users', userId, 'documents'),
    orderBy('uploadDate', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      fileName: data.fileName,
      uploadDate: data.uploadDate instanceof Timestamp
        ? data.uploadDate.toDate()
        : new Date(data.uploadDate),
      type: data.type as DocumentType,
      extractedText: data.extractedText,
      analysis: data.analysis,
      isFavorite: data.isFavorite ?? false,
      customTitle: data.customTitle,
    };
  });
}

export async function getFavoriteDocuments(userId: string): Promise<Document[]> {
  const q = query(
    collection(db, 'users', userId, 'documents'),
    where('isFavorite', '==', true),
    orderBy('uploadDate', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      fileName: data.fileName,
      uploadDate: data.uploadDate instanceof Timestamp
        ? data.uploadDate.toDate()
        : new Date(data.uploadDate),
      type: data.type as DocumentType,
      extractedText: data.extractedText,
      analysis: data.analysis,
      isFavorite: data.isFavorite ?? false,
      customTitle: data.customTitle,
    };
  });
}

export async function updateDocument(
  userId: string,
  documentId: string,
  data: Partial<{
    customTitle: string | null;
    isFavorite: boolean;
    analysis: DocumentAnalysis;
  }>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'documents', documentId);
  await updateDoc(docRef, data);
}

export async function deleteDocument(
  userId: string,
  documentId: string
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'documents', documentId);
  await deleteDoc(docRef);
}

// Usage tracking for rate limiting
export async function getUsageTimestamps(userId: string): Promise<Date[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD

  const docRef = doc(db, 'users', userId, 'usage', dateKey);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return [];
  }

  const data = docSnap.data();
  return (data.timestamps || []).map((ts: Timestamp) => ts.toDate());
}

export async function recordUsage(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateKey = today.toISOString().split('T')[0];

  const docRef = doc(db, 'users', userId, 'usage', dateKey);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const timestamps = data.timestamps || [];
    timestamps.push(serverTimestamp());
    await updateDoc(docRef, { timestamps });
  } else {
    await setDoc(docRef, { timestamps: [serverTimestamp()] });
  }
}

// User preferences
export async function getUserPreferences(userId: string): Promise<{
  theme: string;
  fontSize: string;
} | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data().preferences || { theme: 'system', fontSize: 'medium' };
}

export async function updateUserPreferences(
  userId: string,
  preferences: { theme?: string; fontSize?: string }
): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    [`preferences.theme`]: preferences.theme,
    [`preferences.fontSize`]: preferences.fontSize,
  });
}
