export type DocumentType =
  | 'lease'
  | 'employment'
  | 'nda'
  | 'service'
  | 'purchase'
  | 'loan'
  | 'partnership'
  | 'other';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  lease: 'Lease Agreement',
  employment: 'Employment Contract',
  nda: 'Non-Disclosure Agreement',
  service: 'Service Agreement',
  purchase: 'Purchase Agreement',
  loan: 'Loan Agreement',
  partnership: 'Partnership Agreement',
  other: 'Other Document',
};

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  extractedText?: string;
  analysisId?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentInput {
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  extractedText?: string;
}

export interface UpdateDocumentInput {
  documentType?: DocumentType;
  extractedText?: string;
  analysisId?: string;
  isFavorite?: boolean;
}
