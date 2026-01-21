'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Lightbulb, Scale, CheckCircle } from 'lucide-react';

interface SummaryCardProps {
  summary: string;
  recommendations: string[];
  fairnessAssessment: string;
}

export function SummaryCard({
  summary,
  recommendations,
  fairnessAssessment,
}: SummaryCardProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary-600" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">{summary}</p>
        </CardContent>
      </Card>

      {/* Fairness Assessment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-5 w-5 text-purple-600" />
            Fairness Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">{fairnessAssessment}</p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {recommendation}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
