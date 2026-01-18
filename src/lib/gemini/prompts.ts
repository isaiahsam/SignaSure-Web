import { DocumentType } from '@/types';

export function buildAnalysisPrompt(text: string, documentType: DocumentType): string {
  return `You are a legal expert AI that analyzes documents for potential issues, loopholes, and unfavorable terms.

Analyze the following ${documentType} document for potential issues, loopholes, and unfavorable terms.

Document text:
"${text}"

CRITICAL INSTRUCTIONS:
1. Respond with ONLY valid JSON. Do NOT use markdown code blocks.
2. ONLY flag ACTUAL problems that exist in the document text - do not flag hypothetical issues or missing clauses
3. Be BALANCED and FAIR - Most documents are reasonable. Only flag terms that are genuinely problematic or unusual
4. Risk scoring should be CONSERVATIVE:
   - Most standard documents should score 2-4 (low to moderate)
   - Only flag serious issues that a reasonable person would genuinely be concerned about
   - Reserve scores above 7 for truly predatory or dangerous terms
5. DO NOT flag standard legal boilerplate as problematic (e.g., normal liability clauses, standard warranties, typical termination terms)
6. Recommendations should ONLY be about specific actionable items in THIS document
7. If the document is generally fair and standard, reflect that in your analysis - don't manufacture problems
8. USE SIMPLE LANGUAGE: Write flag titles like you're explaining to a 10-year-old. No legal jargon, no fancy words. Use everyday language that anyone can understand.

Provide analysis in this JSON format:

{
  "documentTitle": "Short descriptive title (3-6 words) based on document content (e.g., 'Apartment Lease Agreement', 'Employment Contract - Tech Corp', 'Car Loan Agreement')",
  "flags": [
    {
      "type": "hiddenFee|unfavorableTerm|missingClause|loophole|automaticRenewal|penaltyClause|limitedLiability|other",
      "title": "VERY SIMPLE title using everyday words a 10-year-old would understand (e.g., 'Hidden Extra Fees', 'You Can't Cancel Easily', 'They Can Change Terms Anytime', 'You Pay If You're Late', 'Hard to Get Your Money Back'). NO legal jargon or complex words.",
      "description": "Detailed explanation of why this specific term is problematic",
      "severity": "low|medium|high|critical",
      "highlightedText": "The exact text from the document that contains the issue"
    }
  ],
  "importantClauses": [
    {
      "title": "Clause name",
      "originalText": "Original complex legal text",
      "simplifiedExplanation": "Simple explanation in plain English",
      "importance": "low|medium|high|critical"
    }
  ],
  "riskScore": 0.0-10.0,
  "summary": "Balanced summary focusing on actual issues found",
  "recommendations": [
    "Specific actionable steps about THIS document only (e.g., 'Negotiate X', 'Request clarification on Y', 'Consider adding Z clause')"
  ],
  "fairnessAssessment": "One of: 'Fair and Balanced' | 'Slightly Favors Other Party' | 'Moderately Unfavorable to You' | 'Heavily Favors Other Party' | 'Potentially Predatory'"
}

Risk Score Guidelines (BE CONSERVATIVE):
- 0-2: Excellent terms, very favorable or standard
- 3-4: Standard and acceptable terms (MOST documents should be here)
- 5-6: Some concerns worth noting, but still reasonable
- 7-8: Significant issues that need attention
- 9-10: Severe problems, do not sign without legal review

Fairness Assessment Guidelines:
Evaluate whether the contract is balanced or favors one party:
- "Fair and Balanced": Terms are equitable for both parties, standard protections for both sides
- "Slightly Favors Other Party": Minor advantages for the other party, still acceptable
- "Moderately Unfavorable to You": Several terms that disadvantage you, renegotiation recommended
- "Heavily Favors Other Party": Significant imbalance, many one-sided terms, serious concerns
- "Potentially Predatory": Extremely unfair, appears designed to trap or exploit you

Consider:
- Do both parties have similar rights/obligations?
- Are termination clauses equal for both parties?
- Who bears most risks and liabilities?
- Are there hidden fees or penalties only for one party?
- Does one party have excessive control or unilateral rights?

Remember: Most legitimate business documents are fair and should score 2-4. Only raise flags for genuinely problematic terms.`;
}

export const geminiResponseSchema = {
  type: 'object',
  properties: {
    documentTitle: { type: 'string' },
    flags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string' },
          highlightedText: { type: 'string' },
        },
        required: ['type', 'title', 'description', 'severity', 'highlightedText'],
      },
    },
    importantClauses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          originalText: { type: 'string' },
          simplifiedExplanation: { type: 'string' },
          importance: { type: 'string' },
        },
        required: ['title', 'originalText', 'simplifiedExplanation', 'importance'],
      },
    },
    riskScore: { type: 'number' },
    summary: { type: 'string' },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
    },
    fairnessAssessment: { type: 'string' },
  },
  required: [
    'documentTitle',
    'flags',
    'importantClauses',
    'riskScore',
    'summary',
    'recommendations',
    'fairnessAssessment',
  ],
};
