import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../models/document.dart';
import 'rate_limit_service.dart';

class AIAnalysisService {
  static String get _apiKey => dotenv.env['GEMINI_API_KEY'] ?? '';

  static Future<DocumentAnalysis?> analyzeDocument(
    String extractedText,
    DocumentType documentType,
  ) async {
    try {
      // Check rate limit first
      final rateLimitResult = await RateLimitService.canMakeRequest();
      if (!rateLimitResult.canProceed) {
        print('Rate limit exceeded: ${rateLimitResult.message}');
        throw RateLimitException(rateLimitResult.message);
      }

      // Validate API key
      if (_apiKey.isEmpty) {
        print('Error: Gemini API key not configured');
        return null;
      }

      final response = await _callGemini(extractedText, documentType);
      if (response != null) {
        // Record successful usage
        await RateLimitService.recordUsage();
        return _parseAnalysisResponse(response);
      }
      return null;
    } catch (e) {
      if (e is RateLimitException || e is AIAnalysisException) {
        rethrow;
      }
      print('Error analyzing document: $e');
      throw AIAnalysisException('Unexpected error during analysis. Please try again.');
    }
  }

  static Future<Map<String, dynamic>?> _callGemini(
    String text,
    DocumentType documentType,
    {int retryCount = 0}
  ) async {
    const maxRetries = 2;

    try {
      // Validate input text
      if (text.trim().isEmpty) {
        throw AIAnalysisException('Document text is empty. Cannot analyze.');
      }

      if (text.length < 50) {
        throw AIAnalysisException('Document text is too short. Please ensure the document contains readable text.');
      }

      final prompt = _buildAnalysisPrompt(text, documentType);

      // Use REST API v1beta with gemini-2.5-flash
      final url = Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$_apiKey'
      );

      final requestBody = {
        'contents': [
          {
            'parts': [
              {'text': prompt}
            ]
          }
        ],
        'generationConfig': {
          'temperature': 0.1,
          'topP': 0.8,
          'topK': 20,
          'maxOutputTokens': 4000,
          'responseMimeType': 'application/json',
          'responseSchema': {
            'type': 'object',
            'properties': {
              'documentTitle': {'type': 'string'},
              'flags': {
                'type': 'array',
                'items': {
                  'type': 'object',
                  'properties': {
                    'type': {'type': 'string'},
                    'title': {'type': 'string'},
                    'description': {'type': 'string'},
                    'severity': {'type': 'string'},
                    'highlightedText': {'type': 'string'}
                  },
                  'required': ['type', 'title', 'description', 'severity', 'highlightedText']
                }
              },
              'importantClauses': {
                'type': 'array',
                'items': {
                  'type': 'object',
                  'properties': {
                    'title': {'type': 'string'},
                    'originalText': {'type': 'string'},
                    'simplifiedExplanation': {'type': 'string'},
                    'importance': {'type': 'string'}
                  },
                  'required': ['title', 'originalText', 'simplifiedExplanation', 'importance']
                }
              },
              'riskScore': {'type': 'number'},
              'summary': {'type': 'string'},
              'recommendations': {
                'type': 'array',
                'items': {'type': 'string'}
              },
              'fairnessAssessment': {'type': 'string'}
            },
            'required': ['documentTitle', 'flags', 'importantClauses', 'riskScore', 'summary', 'recommendations', 'fairnessAssessment']
          }
        }
      };

      print('Calling Gemini API...');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      print('API Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        print('API Response received');

        // Extract text from response
        final candidates = responseData['candidates'] as List?;
        if (candidates != null && candidates.isNotEmpty) {
          final content = candidates[0]['content'];
          final parts = content['parts'] as List;
          if (parts.isNotEmpty) {
            String textResponse = parts[0]['text'] as String;

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

            print('Attempting to parse JSON response...');
            try {
              final parsed = jsonDecode(textResponse);

              // Validate the parsed response has required fields
              if (!_isValidAnalysisResponse(parsed)) {
                throw FormatException('Response missing required fields');
              }

              return parsed;
            } catch (e) {
              print('JSON parsing error: $e');
              print('Raw response preview: ${textResponse.substring(0, textResponse.length > 500 ? 500 : textResponse.length)}');

              // Retry on parsing errors
              if (retryCount < maxRetries) {
                print('Retrying analysis (attempt ${retryCount + 1}/$maxRetries)...');
                await Future.delayed(Duration(seconds: 1 + retryCount));
                return await _callGemini(text, documentType, retryCount: retryCount + 1);
              }

              throw AIAnalysisException('Failed to parse AI response after $maxRetries retries. Please try again.');
            }
          }
        }

        print('Gemini API returned empty response');
        throw AIAnalysisException('AI returned an empty response. Please try again.');
      } else if (response.statusCode == 429) {
        print('Gemini API rate limit: ${response.statusCode}');
        throw AIAnalysisException('API rate limit exceeded. Please wait a moment and try again.');
      } else if (response.statusCode >= 500) {
        print('Gemini API server error: ${response.statusCode}');
        throw AIAnalysisException('AI service is temporarily unavailable. Please try again later.');
      } else {
        print('Gemini API error: ${response.statusCode}');
        print('Error body: ${response.body}');
        throw AIAnalysisException('AI analysis failed (Error ${response.statusCode}). Please try again.');
      }
    } catch (e) {
      if (e is AIAnalysisException) {
        rethrow;
      }
      print('Error calling Gemini API: $e');
      throw AIAnalysisException('Network error. Please check your connection and try again.');
    }
  }

  /// Validate that the AI response has all required fields
  static bool _isValidAnalysisResponse(Map<String, dynamic> response) {
    try {
      // Check required top-level fields
      if (!response.containsKey('documentTitle') ||
          !response.containsKey('flags') ||
          !response.containsKey('importantClauses') ||
          !response.containsKey('riskScore') ||
          !response.containsKey('summary') ||
          !response.containsKey('recommendations')) {
        print('Missing required top-level fields');
        return false;
      }

      // Validate flags is a list
      if (response['flags'] is! List) {
        print('flags is not a list');
        return false;
      }

      // Validate importantClauses is a list
      if (response['importantClauses'] is! List) {
        print('importantClauses is not a list');
        return false;
      }

      // Validate recommendations is a list
      if (response['recommendations'] is! List) {
        print('recommendations is not a list');
        return false;
      }

      // Validate riskScore is a number
      if (response['riskScore'] is! num) {
        print('riskScore is not a number');
        return false;
      }

      return true;
    } catch (e) {
      print('Validation error: $e');
      return false;
    }
  }

  static String _buildAnalysisPrompt(String text, DocumentType documentType) {
    return '''
You are a legal expert AI that analyzes documents for potential issues, loopholes, and unfavorable terms.

Analyze the following ${documentType.toString().split('.').last} document for potential issues, loopholes, and unfavorable terms.

Document text:
"$text"

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

Provide analysis in this JSON format:

{
  "documentTitle": "Short descriptive title (3-6 words) based on document content (e.g., 'Apartment Lease Agreement', 'Employment Contract - Tech Corp', 'Car Loan Agreement')",
  "flags": [
    {
      "type": "hiddenFee|unfavorableTerm|missingClause|loophole|automaticRenewal|penaltyClause|limitedLiability|other",
      "title": "Brief title of the issue",
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

Remember: Most legitimate business documents are fair and should score 2-4. Only raise flags for genuinely problematic terms.
''';
  }

  static DocumentAnalysis _parseAnalysisResponse(Map<String, dynamic> response) {
    final flags = (response['flags'] as List?)
        ?.map((flagData) => AnalysisFlag(
              type: _parseFlagType(flagData['type']),
              title: flagData['title'] ?? '',
              description: flagData['description'] ?? '',
              severity: _parseFlagSeverity(flagData['severity']),
              highlightedText: flagData['highlightedText'] ?? '',
            ))
        .toList() ?? [];

    final importantClauses = (response['importantClauses'] as List?)
        ?.map((clauseData) => ImportantClause(
              title: clauseData['title'] ?? '',
              originalText: clauseData['originalText'] ?? '',
              simplifiedExplanation: clauseData['simplifiedExplanation'] ?? '',
              importance: _parseClauseImportance(clauseData['importance']),
            ))
        .toList() ?? [];

    return DocumentAnalysis(
      documentTitle: response['documentTitle'],
      flags: flags,
      importantClauses: importantClauses,
      riskScore: (response['riskScore'] as num?)?.toDouble() ?? 0.0,
      summary: response['summary'] ?? '',
      recommendations: List<String>.from(response['recommendations'] ?? []),
      fairnessAssessment: response['fairnessAssessment'],
    );
  }

  static FlagType _parseFlagType(String? type) {
    switch (type?.toLowerCase()) {
      case 'hiddenfee':
        return FlagType.hiddenFee;
      case 'unfavorableterm':
        return FlagType.unfavorableTerm;
      case 'missingclause':
        return FlagType.missingClause;
      case 'loophole':
        return FlagType.loophole;
      case 'automaticrenewal':
        return FlagType.automaticRenewal;
      case 'penaltyclause':
        return FlagType.penaltyClause;
      case 'limitedliability':
        return FlagType.limitedLiability;
      default:
        return FlagType.other;
    }
  }

  static FlagSeverity _parseFlagSeverity(String? severity) {
    switch (severity?.toLowerCase()) {
      case 'low':
        return FlagSeverity.low;
      case 'medium':
        return FlagSeverity.medium;
      case 'high':
        return FlagSeverity.high;
      case 'critical':
        return FlagSeverity.critical;
      default:
        return FlagSeverity.low;
    }
  }

  static ClauseImportance _parseClauseImportance(String? importance) {
    switch (importance?.toLowerCase()) {
      case 'low':
        return ClauseImportance.low;
      case 'medium':
        return ClauseImportance.medium;
      case 'high':
        return ClauseImportance.high;
      case 'critical':
        return ClauseImportance.critical;
      default:
        return ClauseImportance.medium;
    }
  }

  static Future<DocumentAnalysis> getMockAnalysis() async {
    await Future.delayed(const Duration(seconds: 2));

    return DocumentAnalysis(
      flags: [
        AnalysisFlag(
          type: FlagType.hiddenFee,
          title: "Hidden Processing Fee",
          description: "Document contains a 3% processing fee that is not clearly disclosed upfront.",
          severity: FlagSeverity.high,
          highlightedText: "additional processing fee of 3% may apply",
        ),
        AnalysisFlag(
          type: FlagType.automaticRenewal,
          title: "Automatic Renewal Clause",
          description: "Contract automatically renews for another full term unless cancelled 60 days prior.",
          severity: FlagSeverity.medium,
          highlightedText: "this agreement shall automatically renew for successive periods",
        ),
      ],
      importantClauses: [
        ImportantClause(
          title: "Termination Clause",
          originalText: "Either party may terminate this agreement with thirty (30) days written notice.",
          simplifiedExplanation: "You or the other party can end this contract by giving 30 days written notice.",
          importance: ClauseImportance.high,
        ),
        ImportantClause(
          title: "Liability Limitation",
          originalText: "In no event shall Company be liable for any indirect, incidental, special, or consequential damages.",
          simplifiedExplanation: "The company won't pay for any extra damages beyond the basic service cost.",
          importance: ClauseImportance.critical,
        ),
      ],
      riskScore: 6.5,
      summary: "This contract has moderate risk factors including hidden fees and automatic renewal. Review termination and liability clauses carefully.",
      recommendations: [
        "Negotiate removal or clear disclosure of the 3% processing fee",
        "Request shorter automatic renewal period or opt-out clause",
        "Consider adding mutual liability limitations",
        "Clarify dispute resolution process",
      ],
    );
  }
}

/// Exception thrown when rate limit is exceeded
class RateLimitException implements Exception {
  final String message;
  RateLimitException(this.message);

  @override
  String toString() => message;
}

/// Exception thrown when AI analysis fails
class AIAnalysisException implements Exception {
  final String message;
  AIAnalysisException(this.message);

  @override
  String toString() => message;
}
