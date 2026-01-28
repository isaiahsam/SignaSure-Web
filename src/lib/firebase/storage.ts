import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage
 * @param userId - The user's ID
 * @param documentId - The document's ID
 * @param file - The file to upload
 * @returns The download URL of the uploaded file
 */
export async function uploadDocumentFile(
  userId: string,
  documentId: string,
  file: File
): Promise<string> {
  if (!storage) throw new Error('Firebase Storage not initialized');

  // Create a reference to the file location
  const fileRef = ref(storage, `users/${userId}/documents/${documentId}/${file.name}`);

  // Upload the file
  await uploadBytes(fileRef, file);

  // Get and return the download URL
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
}

/**
 * Get the download URL for a stored document
 * @param userId - The user's ID
 * @param documentId - The document's ID
 * @param fileName - The file name
 * @returns The download URL
 */
export async function getDocumentFileUrl(
  userId: string,
  documentId: string,
  fileName: string
): Promise<string> {
  if (!storage) throw new Error('Firebase Storage not initialized');

  const fileRef = ref(storage, `users/${userId}/documents/${documentId}/${fileName}`);
  return getDownloadURL(fileRef);
}
