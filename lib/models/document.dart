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
  final String? fairnessAssessment;  // "Fair and Balanced", "Slightly Unfavorable", etc.

  DocumentAnalysis({
    this.documentTitle,
    required this.flags,
    required this.importantClauses,
    required this.riskScore,
    required this.summary,
    required this.recommendations,
    this.fairnessAssessment,
  });

  /// Get sorted flags by priority (highest priority first)
  List<AnalysisFlag> get flagsByPriority {
    final sortedFlags = List<AnalysisFlag>.from(flags);
    sortedFlags.sort((a, b) => b.priorityScore.compareTo(a.priorityScore));
    return sortedFlags;
  }

  /// Get count of flags by severity
  Map<FlagSeverity, int> get flagCountBySeverity {
    final counts = <FlagSeverity, int>{
      FlagSeverity.critical: 0,
      FlagSeverity.high: 0,
      FlagSeverity.medium: 0,
      FlagSeverity.low: 0,
    };
    for (var flag in flags) {
      counts[flag.severity] = (counts[flag.severity] ?? 0) + 1;
    }
    return counts;
  }

  /// Get count of critical priority flags (P1)
  int get criticalPriorityCount => flags.where((f) => f.priorityScore >= 100).length;

  /// Get count of high priority flags (P2)
  int get highPriorityCount => flags.where((f) => f.priorityScore >= 70 && f.priorityScore < 100).length;

  /// Get count of medium priority flags (P3)
  int get mediumPriorityCount => flags.where((f) => f.priorityScore >= 40 && f.priorityScore < 70).length;

  /// Get count of low priority flags (P4)
  int get lowPriorityCount => flags.where((f) => f.priorityScore < 40).length;

  Map<String, dynamic> toJson() {
    return {
      'documentTitle': documentTitle,
      'flags': flags.map((f) => f.toJson()).toList(),
      'importantClauses': importantClauses.map((c) => c.toJson()).toList(),
      'riskScore': riskScore,
      'summary': summary,
      'recommendations': recommendations,
      'fairnessAssessment': fairnessAssessment,
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
      fairnessAssessment: json['fairnessAssessment'],
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

  /// Get priority score for ranking (higher = more urgent)
  /// Critical: 100-120, High: 70-99, Medium: 40-69, Low: 0-39
  int get priorityScore {
    // Base score from severity
    int baseScore = switch (severity) {
      FlagSeverity.critical => 100,
      FlagSeverity.high => 70,
      FlagSeverity.medium => 40,
      FlagSeverity.low => 10,
    };

    // Add weight based on flag type (some types are inherently more serious)
    int typeBonus = switch (type) {
      FlagType.hiddenFee => 15,          // Financial impact - high priority
      FlagType.loophole => 15,            // Could be exploited - high priority
      FlagType.penaltyClause => 12,       // Financial penalties - high priority
      FlagType.unfavorableTerm => 10,     // Disadvantageous - medium-high priority
      FlagType.limitedLiability => 8,     // Legal protection issue - medium priority
      FlagType.automaticRenewal => 7,     // Could trap you - medium priority
      FlagType.missingClause => 5,        // Lack of protection - lower priority
      FlagType.other => 0,                // Unknown - no bonus
    };

    return baseScore + typeBonus;
  }

  /// Get action label based on priority
  String get actionLabel {
    if (priorityScore >= 100) return 'ADDRESS IMMEDIATELY';
    if (priorityScore >= 80) return 'DISCUSS WITH LAWYER';
    if (priorityScore >= 50) return 'NEGOTIATE THIS';
    return 'BE AWARE';
  }

  /// Get priority rank label (for display)
  String get priorityRank {
    if (priorityScore >= 100) return 'P1 - CRITICAL';
    if (priorityScore >= 70) return 'P2 - HIGH';
    if (priorityScore >= 40) return 'P3 - MEDIUM';
    return 'P4 - LOW';
  }

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