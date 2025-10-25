class Document {
  final String id;
  final String filePath;
  final String fileName;
  final DateTime scanDate;
  final DocumentType type;
  final String? extractedText;
  final DocumentAnalysis? analysis;
  final bool isFavorite;
  final String? customTitle;

  Document({
    required this.id,
    required this.filePath,
    required this.fileName,
    required this.scanDate,
    required this.type,
    this.extractedText,
    this.analysis,
    this.isFavorite = false,
    this.customTitle,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'filePath': filePath,
      'fileName': fileName,
      'scanDate': scanDate.toIso8601String(),
      'type': type.toString(),
      'extractedText': extractedText,
      'analysis': analysis?.toJson(),
      'isFavorite': isFavorite ? 1 : 0,
      'customTitle': customTitle,
    };
  }

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      id: json['id'],
      filePath: json['filePath'],
      fileName: json['fileName'],
      scanDate: DateTime.parse(json['scanDate']),
      type: DocumentType.values.firstWhere(
        (e) => e.toString() == json['type'],
        orElse: () => DocumentType.other,
      ),
      extractedText: json['extractedText'],
      analysis: json['analysis'] != null
          ? DocumentAnalysis.fromJson(json['analysis'])
          : null,
      isFavorite: json['isFavorite'] == 1,
      customTitle: json['customTitle'],
    );
  }

  String get displayTitle => customTitle ?? analysis?.documentTitle ?? fileName;
}

enum DocumentType {
  contract,
  lease,
  loan,
  insurance,
  employment,
  other,
}

class DocumentAnalysis {
  final String? documentTitle;
  final List<AnalysisFlag> flags;
  final List<ImportantClause> importantClauses;
  final double riskScore;
  final String summary;
  final List<String> recommendations;

  DocumentAnalysis({
    this.documentTitle,
    required this.flags,
    required this.importantClauses,
    required this.riskScore,
    required this.summary,
    required this.recommendations,
  });

  Map<String, dynamic> toJson() {
    return {
      'documentTitle': documentTitle,
      'flags': flags.map((f) => f.toJson()).toList(),
      'importantClauses': importantClauses.map((c) => c.toJson()).toList(),
      'riskScore': riskScore,
      'summary': summary,
      'recommendations': recommendations,
    };
  }

  factory DocumentAnalysis.fromJson(Map<String, dynamic> json) {
    return DocumentAnalysis(
      documentTitle: json['documentTitle'],
      flags: (json['flags'] as List)
          .map((f) => AnalysisFlag.fromJson(f))
          .toList(),
      importantClauses: (json['importantClauses'] as List)
          .map((c) => ImportantClause.fromJson(c))
          .toList(),
      riskScore: json['riskScore'].toDouble(),
      summary: json['summary'],
      recommendations: List<String>.from(json['recommendations']),
    );
  }
}

class AnalysisFlag {
  final FlagType type;
  final String title;
  final String description;
  final FlagSeverity severity;
  final String highlightedText;

  AnalysisFlag({
    required this.type,
    required this.title,
    required this.description,
    required this.severity,
    required this.highlightedText,
  });

  Map<String, dynamic> toJson() {
    return {
      'type': type.toString(),
      'title': title,
      'description': description,
      'severity': severity.toString(),
      'highlightedText': highlightedText,
    };
  }

  factory AnalysisFlag.fromJson(Map<String, dynamic> json) {
    return AnalysisFlag(
      type: FlagType.values.firstWhere(
        (e) => e.toString() == json['type'],
        orElse: () => FlagType.other,
      ),
      title: json['title'],
      description: json['description'],
      severity: FlagSeverity.values.firstWhere(
        (e) => e.toString() == json['severity'],
        orElse: () => FlagSeverity.low,
      ),
      highlightedText: json['highlightedText'],
    );
  }
}

enum FlagType {
  hiddenFee,
  unfavorableTerm,
  missingClause,
  loophole,
  automaticRenewal,
  penaltyClause,
  limitedLiability,
  other,
}

enum FlagSeverity {
  low,
  medium,
  high,
  critical,
}

class ImportantClause {
  final String title;
  final String originalText;
  final String simplifiedExplanation;
  final ClauseImportance importance;

  ImportantClause({
    required this.title,
    required this.originalText,
    required this.simplifiedExplanation,
    required this.importance,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'originalText': originalText,
      'simplifiedExplanation': simplifiedExplanation,
      'importance': importance.toString(),
    };
  }

  factory ImportantClause.fromJson(Map<String, dynamic> json) {
    return ImportantClause(
      title: json['title'],
      originalText: json['originalText'],
      simplifiedExplanation: json['simplifiedExplanation'],
      importance: ClauseImportance.values.firstWhere(
        (e) => e.toString() == json['importance'],
        orElse: () => ClauseImportance.medium,
      ),
    );
  }
}

enum ClauseImportance {
  low,
  medium,
  high,
  critical,
}