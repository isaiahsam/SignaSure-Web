import type { DocumentType } from '@/types';

export function buildAnalysisPrompt(
  documentText: string,
  documentType: DocumentType
): string {
  return `You are an expert legal document analyst. Analyze the following ${documentType} document and provide a comprehensive assessment. Your analysis should be helpful for someone who is not a lawyer and needs to understand the key points, risks, and important clauses in simple, plain English.

DOCUMENT TEXT:
${documentText}

INSTRUCTIONS:
1. Calculate a risk score from 0-100:
   - 0-20: Very safe, standard terms, no concerns
   - 21-40: Low risk, minor items to be aware of
   - 41-60: Moderate risk, some clauses need attention
   - 61-80: High risk, significant concerns present
   - 81-100: Very high risk, major red flags
2. Provide a clear summary of what this document is about
3. Identify any flags (potential issues or concerns) with severity levels
4. Extract important clauses and explain them in simple terms
5. Give practical recommendations
6. Assess the overall fairness of the document

CRITICAL: You MUST respond with a COMPLETE, valid JSON object. Do not truncate or cut off your response.

JSON STRUCTURE (follow this exactly):
{
  "riskScore": <number 0-100>,
  "summary": "<2-3 sentence summary of the document in plain English>",
  "flags": [
    {
      "id": "<unique id like flag-1>",
      "type": "<one of: liability, termination, payment, intellectual_property, confidentiality, dispute, renewal, penalty, obligation, other>",
      "severity": "<one of: low, medium, high, critical>",
      "title": "<short title>",
      "description": "<clear explanation of the concern in plain English>",
      "originalText": "<relevant text from document if applicable>",
      "recommendation": "<what to do about this>"
    }
  ],
  "importantClauses": [
    {
      "id": "<unique id like clause-1>",
      "title": "<clause title>",
      "originalText": "<the actual clause text - keep brief, max 200 chars>",
      "simplifiedExplanation": "<what this means in very simple terms>",
      "importance": "<one of: low, medium, high>"
    }
  ],
  "recommendations": [
    "<specific, actionable recommendation>"
  ],
  "fairnessAssessment": "<overall assessment of how fair/balanced this document is>"
}

IMPORTANT RULES:
- Use plain, simple English that anyone can understand
- Avoid legal jargon unless you explain it
- If this is a standard, fair document with no issues, say so and give a LOW risk score (0-20)
- If there are no concerning flags, return an empty flags array [] - this is OK!
- Keep originalText excerpts brief (under 200 characters) to avoid response truncation
- Focus on practical implications for the person signing
- ALWAYS complete the full JSON structure - never leave it incomplete`;
}

export const analysisResponseSchema = {
  type: 'object',
  properties: {
    riskScore: { type: 'number', minimum: 0, maximum: 100 },
    summary: { type: 'string' },
    flags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: {
            type: 'string',
            enum: [
              'liability',
              'termination',
              'payment',
              'intellectual_property',
              'confidentiality',
              'dispute',
              'renewal',
              'penalty',
              'obligation',
              'other',
            ],
          },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
          },
          title: { type: 'string' },
          description: { type: 'string' },
          originalText: { type: 'string' },
          recommendation: { type: 'string' },
        },
        required: ['id', 'type', 'severity', 'title', 'description'],
      },
    },
    importantClauses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          originalText: { type: 'string' },
          simplifiedExplanation: { type: 'string' },
          importance: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
          },
        },
        required: ['id', 'title', 'originalText', 'simplifiedExplanation', 'importance'],
      },
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
    },
    fairnessAssessment: { type: 'string' },
  },
  required: [
    'riskScore',
    'summary',
    'flags',
    'importantClauses',
    'recommendations',
    'fairnessAssessment',
  ],
};
