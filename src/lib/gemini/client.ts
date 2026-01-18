import { DocumentType, GeminiAnalysisResponse } from '@/types';
import { buildAnalysisPrompt, geminiResponseSchema } from './prompts';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export class GeminiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeDocument(
    text: string,
    documentType: DocumentType
  ): Promise<GeminiAnalysisResponse> {
    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('Document text is empty. Cannot analyze.');
    }

    if (text.length < 50) {
      throw new Error('Document text is too short. Please ensure the document contains readable text.');
    }

    const prompt = buildAnalysisPrompt(text, documentType);

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 4000,
        responseMimeType: 'application/json',
        responseSchema: geminiResponseSchema,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status === 400) {
        throw new Error('Invalid request to AI service. Please try a different document.');
      }
      if (response.status >= 500) {
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      }
      throw new Error(`AI analysis failed (Error ${response.status}). Please try again.`);
    }

    const responseData = await response.json();
    console.log('Gemini response received');

    // Extract text from response
    const candidates = responseData.candidates;
    if (!candidates || candidates.length === 0) {
      console.error('No candidates in response:', JSON.stringify(responseData));
      throw new Error('AI returned an empty response. Please try again.');
    }

    const content = candidates[0].content;
    const parts = content?.parts;
    if (!parts || parts.length === 0) {
      console.error('No parts in response:', JSON.stringify(candidates[0]));
      throw new Error('AI returned an empty response. Please try again.');
    }

    let textResponse = parts[0].text as string;
    console.log('Raw response length:', textResponse?.length || 0);

    // Remove markdown code blocks if present
    textResponse = textResponse.trim();
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.substring(7);
    } else if (textResponse.startsWith('```')) {
      textResponse = textResponse.substring(3);
    }
    if (textResponse.endsWith('```')) {
      textResponse = textResponse.substring(0, textResponse.length - 3);
    }
    textResponse = textResponse.trim();

    try {
      const parsed = JSON.parse(textResponse) as GeminiAnalysisResponse;

      // Validate required fields
      if (!this.isValidResponse(parsed)) {
        console.warn('Response missing some fields, using partial data');
      }

      return parsed;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw text (first 500 chars):', textResponse.substring(0, 500));
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  private isValidResponse(response: GeminiAnalysisResponse): boolean {
    return (
      typeof response.documentTitle === 'string' &&
      Array.isArray(response.flags) &&
      Array.isArray(response.importantClauses) &&
      typeof response.riskScore === 'number' &&
      typeof response.summary === 'string' &&
      Array.isArray(response.recommendations)
    );
  }
}
