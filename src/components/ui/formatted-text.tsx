'use client';

import { parseMarkdown } from '@/lib/utils';
import { type Clause } from '@/types';

interface FormattedTextProps {
  text: string;
  className?: string;
  clauses?: Clause[];
  onClauseClick?: (clauseId: string) => void;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renders text with markdown formatting (bold, italic) and optional clause links
 */
export function FormattedText({ text, className, clauses, onClauseClick }: FormattedTextProps) {
  const parts = parseMarkdown(text);

  // Function to check if text contains a clause reference and make it clickable
  const renderWithClauseLinks = (content: string, key: string) => {
    if (!clauses || clauses.length === 0 || !onClauseClick) {
      return content;
    }

    // Look for clause references like "Clause 1", "clause-1", or clause titles
    let result: React.ReactNode[] = [content];

    clauses.forEach((clause) => {
      const newResult: React.ReactNode[] = [];

      result.forEach((part, partIndex) => {
        if (typeof part !== 'string') {
          newResult.push(part);
          return;
        }

        // Create patterns to match clause references
        const patterns = [
          new RegExp(`(${escapeRegExp(clause.title)})`, 'gi'),
          new RegExp(`(Clause\\s*${escapeRegExp(clause.id.replace('clause-', ''))})`, 'gi'),
          new RegExp(`(${escapeRegExp(clause.id)})`, 'gi'),
        ];

        let remaining = part;
        let hasMatch = false;

        for (const pattern of patterns) {
          if (pattern.test(remaining)) {
            hasMatch = true;
            const splitParts = remaining.split(pattern);

            splitParts.forEach((splitPart, splitIndex) => {
              if (pattern.test(splitPart)) {
                newResult.push(
                  <button
                    key={`${key}-${partIndex}-${splitIndex}-${clause.id}`}
                    onClick={() => onClauseClick(clause.id)}
                    className="text-primary-600 dark:text-primary-400 underline hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    {splitPart}
                  </button>
                );
              } else if (splitPart) {
                newResult.push(splitPart);
              }
            });

            break;
          }
        }

        if (!hasMatch) {
          newResult.push(part);
        }
      });

      result = newResult;
    });

    return result;
  };

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const key = `part-${index}`;
        const content = renderWithClauseLinks(part.content, key);

        switch (part.type) {
          case 'bold':
            return (
              <strong key={key} className="font-semibold">
                {content}
              </strong>
            );
          case 'italic':
            return (
              <em key={key} className="italic">
                {content}
              </em>
            );
          default:
            return <span key={key}>{content}</span>;
        }
      })}
    </span>
  );
}
