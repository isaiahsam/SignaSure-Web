'use client';

import Link from 'next/link';
import { Document, getDocumentDisplayTitle } from '@/types';
import { formatShortDate, cn } from '@/lib/utils';
import { FileText, Star, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface DocumentCardProps {
  document: Document;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
  onEditTitle?: (id: string, title: string) => void;
}

export function DocumentCard({
  document,
  onToggleFavorite,
  onDelete,
  onEditTitle,
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(getDocumentDisplayTitle(document));

  const riskScore = document.analysis?.riskScore ?? 0;
  const riskColor =
    riskScore <= 2
      ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      : riskScore <= 6
      ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
      : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';

  const handleSaveTitle = () => {
    if (editTitle.trim() && onEditTitle) {
      onEditTitle(document.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 ease-out hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-700">
      <div className="flex items-start justify-between">
        <Link href={`/analysis/${document.id}`} className="flex-1">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 transition-colors duration-200"
                  autoFocus
                  onClick={(e) => e.preventDefault()}
                />
              ) : (
                <h3 className="font-medium text-gray-900 truncate dark:text-white transition-colors duration-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {getDocumentDisplayTitle(document)}
                </h3>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {formatShortDate(document.uploadDate)}
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(document.id, !document.isFavorite);
            }}
            className={cn(
              'rounded-lg p-1.5 transition-all duration-200 hover:scale-110 active:scale-95',
              document.isFavorite
                ? 'text-yellow-500'
                : 'text-gray-400 hover:text-yellow-500'
            )}
          >
            <Star
              className={cn(
                'h-5 w-5 transition-transform duration-200',
                document.isFavorite && 'animate-bounce-soft'
              )}
              fill={document.isFavorite ? 'currentColor' : 'none'}
            />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800 animate-scale-in origin-top-right">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors duration-150"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Title
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowMenu(false);
                      onDelete?.(document.id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-150"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {document.analysis && (
        <div className="mt-3 flex items-center gap-3">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium transition-transform duration-200 hover:scale-105',
              riskColor
            )}
          >
            Risk: {riskScore.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {document.analysis.flags.length} flags
          </span>
        </div>
      )}
    </div>
  );
}
