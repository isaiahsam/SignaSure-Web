'use client';

import { Select } from '@/components/ui/select';
import { DocumentType, DOCUMENT_TYPE_LABELS } from '@/types';

interface DocumentTypeSelectProps {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function DocumentTypeSelect({
  value,
  onChange,
  label = 'Document Type',
  error,
  disabled,
}: DocumentTypeSelectProps) {
  const options = Object.entries(DOCUMENT_TYPE_LABELS).map(([val, lab]) => ({
    value: val,
    label: lab,
  }));

  return (
    <Select
      label={label}
      value={value}
      onChange={(val) => onChange(val as DocumentType)}
      options={options}
      error={error}
      disabled={disabled}
      placeholder="Select document type"
    />
  );
}
