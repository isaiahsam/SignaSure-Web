import type { DocumentType } from '@/types';

export function buildAnalysisPrompt(
  documentText: string,
  documentType: DocumentType
): string {
  return `You are an expert legal document analyst. Analyze the following ${documentType} document and provide a comprehensive assessment. Your analysis should be helpful for someone who is not a lawyer and needs to understand the key points, risks, and important clauses in simple, plain English.

DOCUMENT TEXT:
${documentText}

INSTRUCTIONS:
1. Calculate a risk score from 0-100 (0 = very safe, 100 = very risky)
2. Provide a clear summary of what this document is about
3. Identify any flags (potential issues or concerns) with severity levels
4. Extract important clauses and explain them in simple terms
5. Give practical recommendations
6. Assess the overall fairness of the document

Respond with a valid JSON object following this exact structure:
{
  "riskScore": <number 0-100>,
  "summary": "<2-3 sentence summary of the document in plain English>",
  "flags": [
    {
      "id": "<unique id>",
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
      "id": "<unique id>",
      "title": "<clause title>",
      "originalText": "<the actual clause text>",
      "simplifiedExplanation": "<what this means in very simple terms, as if explaining to a friend>",
      "importance": "<one of: low, medium, high>"
    }
  ],
  "recommendations": [
    "<specific, actionable recommendation>"
  ],
  "fairnessAssessment": "<overall assessment of how fair/balanced this document is, written in plain English>"
}

IMPORTANT:
- Use plain, simple English that anyone can understand
- Avoid legal jargon unless you explain it
- Be specific about what parts of the document you're referencing
- Focus on practical implications for the person signing
- If something is unusual or concerning, explain why clearly`;
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
