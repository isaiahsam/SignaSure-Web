import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/document.dart';

class AIAnalysisService {
  static const String _baseUrl = 'https://api.openai.com/v1/chat/completions';
  static const String _apiKey = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your API key

  static Future<DocumentAnalysis?> analyzeDocument(String extractedText, DocumentType documentType) async {
    try {
      final response = await _callOpenAI(extractedText, documentType);
      if (response != null) {
        return _parseAnalysisResponse(response);
      }
      return null;
    } catch (e) {
      print('Error analyzing document: $e');
      return null;
    }
  }

  static Future<Map<String, dynamic>?> _callOpenAI(String text, DocumentType documentType) async {
    try {
      final prompt = _buildAnalysisPrompt(text, documentType);

      final headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_apiKey',
      };

      final body = jsonEncode({
        'model': 'gpt-4',
        'messages': [
          {
            'role': 'system',
            'content': 'You are a legal expert AI that analyzes documents for potential issues, loopholes, and unfavorable terms. Always respond in the exact JSON format requested.'
          },
          {
            'role': 'user',
            'content': prompt
          }
        ],
        'max_tokens': 4000,
        'temperature': 0.3,
      });

      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: headers,
        body: body,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final content = data['choices'][0]['message']['content'];
        return jsonDecode(content);
      } else {
        print('OpenAI API error: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      print('Error calling OpenAI API: $e');
      return null;
    }
  }

  static String _buildAnalysisPrompt(String text, DocumentType documentType) {
    return '''
Analyze the following ${documentType.toString().split('.').last} document for potential issues, loopholes, and unfavorable terms.

Document text:
"$text"

Please provide a comprehensive analysis in the following JSON format:

{
  "flags": [
    {
      "type": "hiddenFee|unfavorableTerm|missingClause|loophole|automaticRenewal|penaltyClause|limitedLiability|other",
      "title": "Brief title of the issue",
      "description": "Detailed explanation of why this is problematic",
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
  "summary": "Overall summary of the document analysis",
  "recommendations": [
    "Specific actionable recommendations for the user"
  ]
}

Focus on:
1. Hidden fees or costs
2. Automatic renewal clauses
3. Penalty or termination clauses
4. Limited liability clauses
5. Unfavorable payment terms
6. Missing standard protections
7. Vague or ambiguous language
8. One-sided terms favoring the other party
9. Dispute resolution limitations
10. Data privacy concerns

Provide practical, actionable advice for a non-lawyer.
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