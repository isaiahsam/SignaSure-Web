'use client';

import Link from 'next/link';
import { cn, formatDate, formatFileSize, getRiskColor, getRiskLabel, getRiskBarColor } from '@/lib/utils';
import { DOCUMENT_TYPE_LABELS, Document } from '@/types';
import { FileText, Star, MoreVertical, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';

interface DocumentCardProps {
  document: Document;
  riskScore?: number;
  onToggleFavorite?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
}

export function DocumentCard({
  document: doc,
  riskScore,
  onToggleFavorite,
  onDelete,
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow flex">
      {riskScore !== undefined && (
        <div className={cn('w-1.5 shrink-0 rounded-l-xl', getRiskBarColor(riskScore))} />
      )}
      <div className="flex items-start gap-4 flex-1 min-w-0 p-4">
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
          <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/analysis/${doc.id}`}
                className="font-medium text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 truncate block"
              >
                {doc.fileName}
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {DOCUMENT_TYPE_LABELS[doc.documentType]}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(doc.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star
                    className={cn(
                      'h-4 w-4',
                      doc.isFavorite
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-400'
                    )}
                  />
                </Button>
              )}

              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1 z-10 animate-fade-in">
                    <Link
                      href={`/analysis/${doc.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Eye className="h-4 w-4" />
                      View Analysis
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(doc.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>{formatDate(doc.createdAt)}</span>
            {riskScore !== undefined && (
              <span className={cn('font-medium', getRiskColor(riskScore))}>
                {getRiskLabel(riskScore)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
