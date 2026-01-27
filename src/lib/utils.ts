import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FlagSeverity } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getRiskColor(score: number): string {
  if (score <= 30) return 'text-green-600 dark:text-green-400';
  if (score <= 60) return 'text-yellow-600 dark:text-yellow-400';
  if (score <= 80) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export function getRiskBgColor(score: number): string {
  if (score <= 30) return 'bg-green-100 dark:bg-green-900/30';
  if (score <= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
  if (score <= 80) return 'bg-orange-100 dark:bg-orange-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

export function getRiskLabel(score: number): string {
  if (score <= 30) return 'Low Risk';
  if (score <= 60) return 'Medium Risk';
  if (score <= 80) return 'High Risk';
  return 'Critical Risk';
}

export function getSeverityColor(severity: FlagSeverity): string {
  const colors: Record<FlagSeverity, string> = {
    low: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400',
  };
  return colors[severity];
}

export function getSeverityBgColor(severity: FlagSeverity): string {
  const colors: Record<FlagSeverity, string> = {
    low: 'bg-green-100 dark:bg-green-900/30',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30',
    high: 'bg-orange-100 dark:bg-orange-900/30',
    critical: 'bg-red-100 dark:bg-red-900/30',
  };
  return colors[severity];
}

export function getImportanceColor(importance: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: 'text-slate-600 dark:text-slate-400',
    medium: 'text-blue-600 dark:text-blue-400',
    high: 'text-purple-600 dark:text-purple-400',
  };
  return colors[importance];
}

export function getImportanceBgColor(importance: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: 'bg-slate-100 dark:bg-slate-800',
    medium: 'bg-blue-100 dark:bg-blue-900/30',
    high: 'bg-purple-100 dark:bg-purple-900/30',
  };
  return colors[importance];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Parse simple markdown formatting (bold, italic) and return structured parts
 * Supports: **bold**, *italic*, __bold__, _italic_
 */
export function parseMarkdown(text: string): Array<{ type: 'text' | 'bold' | 'italic'; content: string }> {
  const parts: Array<{ type: 'text' | 'bold' | 'italic'; content: string }> = [];

  // Regex to match **bold** or __bold__ or *italic* or _italic_
  const regex = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    // Add the formatted text
    if (match[1]) {
      // Bold match (**text** or __text__)
      parts.push({ type: 'bold', content: match[2] });
    } else if (match[3]) {
      // Italic match (*text* or _text_)
      parts.push({ type: 'italic', content: match[4] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  // If no matches found, return the whole text
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
}
