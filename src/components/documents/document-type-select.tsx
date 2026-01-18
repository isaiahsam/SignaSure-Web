'use client';

import { DocumentType } from '@/types';
import { Select } from '@/components/ui';

interface DocumentTypeSelectProps {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
  className?: string;
}

const documentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.contract]: 'Contract',
  [DocumentType.lease]: 'Lease Agreement',
  [DocumentType.loan]: 'Loan Agreement',
  [DocumentType.insurance]: 'Insurance Policy',
  [DocumentType.employment]: 'Employment Contract',
  [DocumentType.other]: 'Other',
};

export function DocumentTypeSelect({
  value,
  onChange,
  className,
}: DocumentTypeSelectProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as DocumentType)}
      className={className}
    >
      {Object.entries(documentTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>
          {label}
        </option>
      ))}
    </Select>
  );
}
