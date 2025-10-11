import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../models/document.dart';

class AIAnalysisService {
  static String get _apiKey => dotenv.env['GEMINI_API_KEY'] ?? '';

  static Future<DocumentAnalysis?> analyzeDocument(String extractedText, DocumentType documentType) async {
    try {
      // Debug: Print API key status
      print('API Key loaded: ${_apiKey.isNotEmpty}');
      print('API Key length: ${_apiKey.length}');
      print('API Key first 10 chars: ${_apiKey.length >= 10 ? _apiKey.substring(0, 10) : _apiKey}');

      // Validate API key
      if (_apiKey.isEmpty || _apiKey == 'your_gemini_api_key_here') {
        print('Error: Gemini API key not configured');
        return null;
      }

      final response = await _callGemini(extractedText, documentType);
      if (response != null) {
        return _parseAnalysisResponse(response);
      }
      return null;
    } catch (e) {
      print('Error analyzing document: $e');
      return null;
    }
  }

  static Future<Map<String, dynamic>?> _callGemini(String text, DocumentType documentType) async {
    try {
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
          'temperature': 0.3,
          'maxOutputTokens': 4000,
          'responseMimeType': 'application/json',
          'responseSchema': {
            'type': 'object',
            'properties': {
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
              }
            },
            'required': ['flags', 'importantClauses', 'riskScore', 'summary', 'recommendations']
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
              return jsonDecode(textResponse);
            } catch (e) {
              print('JSON parsing error: $e');
              print('Raw response preview: ${textResponse.substring(0, textResponse.length > 500 ? 500 : textResponse.length)}');
              return null;
            }
          }
        }

        print('Gemini API returned empty response');
        return null;
      } else {
        print('Gemini API error: ${response.statusCode}');
        print('Error body: ${response.body}');
        return null;
      }
    } catch (e) {
      print('Error calling Gemini API: $e');
      return null;
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
2. ONLY flag ACTUAL problems that exist in the document text - do not flag hypothetical issues or missing clauses unless they are critical
3. Be balanced and fair - normal standard terms should have LOW risk scores (1-3), moderate concerns MEDIUM (4-6), serious issues HIGH (7-8), only truly dangerous terms CRITICAL (9-10)
4. Recommendations should ONLY be about what to do with THIS specific document (e.g., "Negotiate the fee in section 3", "Request clarification on the termination clause") - DO NOT give generic advice about conversations or relationships
5. Only highlight clauses that are actually unusual, unfavorable, or important - standard boilerplate should be ignored

Provide analysis in this JSON format:

{
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
  ]
}

Risk Score Guidelines:
- 0-2: Very safe, standard terms
- 3-4: Minor concerns, mostly standard
- 5-6: Moderate concerns worth reviewing
- 7-8: Significant issues requiring attention
- 9-10: Severe problems, do not sign without legal review

ONLY flag real issues. If the document is fairly standard, reflect that with appropriate low-to-medium scores.
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
      flags: flags,
      importantClauses: importantClauses,
      riskScore: (response['riskScore'] as num?)?.toDouble() ?? 0.0,
      summary: response['summary'] ?? '',
      recommendations: List<String>.from(response['recommendations'] ?? []),
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
