import 'dart:io';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import '../models/document.dart';

class AnalysisResultScreen extends StatefulWidget {
  final Document document;

  const AnalysisResultScreen({super.key, required this.document});

  @override
  State<AnalysisResultScreen> createState() => _AnalysisResultScreenState();
}

class _AnalysisResultScreenState extends State<AnalysisResultScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Color _getRiskColor(double riskScore) {
    if (riskScore <= 2) return Colors.green;
    if (riskScore <= 6) return Colors.orange;
    return Colors.red;
  }

  String _getRiskText(double riskScore) {
    // Risk Score Guidelines from AI Analysis Service:
    // 0-2: Very safe, standard terms
    // 3-4: Minor concerns, mostly standard
    // 5-6: Moderate concerns worth reviewing
    // 7-8: Significant issues requiring attention
    // 9-10: Severe problems, do not sign without legal review
    if (riskScore <= 2) return 'Low Risk';
    if (riskScore <= 4) return 'Low-Medium Risk';
    if (riskScore <= 6) return 'Medium Risk';
    if (riskScore <= 8) return 'High Risk';
    return 'Critical Risk';
  }

  String _getSigningRecommendation(double riskScore) {
    if (riskScore <= 2) return 'Ready to Sign';
    if (riskScore <= 6) return 'Sign with Caution';
    return 'Do Not Sign - Consult Legal Counsel';
  }

  Color _getRecommendationColor(double riskScore) {
    if (riskScore <= 2) return Colors.green;
    if (riskScore <= 6) return Colors.orange;
    return Colors.red;
  }

  IconData _getRecommendationIcon(double riskScore) {
    if (riskScore <= 2) return Icons.check_circle;
    if (riskScore <= 6) return Icons.warning;
    return Icons.cancel;
  }

  Color _getSeverityColor(FlagSeverity severity) {
    switch (severity) {
      case FlagSeverity.low:
        return Colors.blue;
      case FlagSeverity.medium:
        return Colors.orange;
      case FlagSeverity.high:
        return Colors.red;
      case FlagSeverity.critical:
        return Colors.red[900]!;
    }
  }

  IconData _getSeverityIcon(FlagSeverity severity) {
    switch (severity) {
      case FlagSeverity.low:
        return Icons.info;
      case FlagSeverity.medium:
        return Icons.warning;
      case FlagSeverity.high:
        return Icons.error;
      case FlagSeverity.critical:
        return Icons.dangerous;
    }
  }

  Color _getImportanceColor(ClauseImportance importance) {
    switch (importance) {
      case ClauseImportance.low:
        return Colors.green;
      case ClauseImportance.medium:
        return Colors.orange;
      case ClauseImportance.high:
        return Colors.red;
      case ClauseImportance.critical:
        return Colors.red[900]!;
    }
  }

  String _getFlagTypeDisplayName(FlagType type) {
    switch (type) {
      case FlagType.hiddenFee:
        return 'Hidden Fee';
      case FlagType.unfavorableTerm:
        return 'Unfavorable Term';
      case FlagType.missingClause:
        return 'Missing Clause';
      case FlagType.loophole:
        return 'Loophole';
      case FlagType.automaticRenewal:
        return 'Auto Renewal';
      case FlagType.penaltyClause:
        return 'Penalty Clause';
      case FlagType.limitedLiability:
        return 'Limited Liability';
      case FlagType.other:
        return 'Other Issue';
    }
  }

  bool _isPdfFile(String filePath) {
    return filePath.toLowerCase().endsWith('.pdf');
  }

  bool _isImageFile(String filePath) {
    final ext = filePath.toLowerCase();
    return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png');
  }

  bool _isTextFile(String filePath) {
    final ext = filePath.toLowerCase();
    return ext.endsWith('.txt') || ext.endsWith('.doc') || ext.endsWith('.docx');
  }

  void _viewDocument() async {
    final filePath = widget.document.filePath;

    // Check if file exists
    final file = File(filePath);
    if (!await file.exists()) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Document file not found')),
      );
      return;
    }

    // For text files, show extracted text
    if (_isTextFile(filePath)) {
      showDialog(
        context: context,
        builder: (context) => Dialog(
          child: Column(
            children: [
              AppBar(
                title: const Text('Document Text'),
                leading: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    widget.document.extractedText ?? 'No text available',
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
      return;
    }

    // For PDF files, use PDF viewer
    if (_isPdfFile(filePath)) {
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => Scaffold(
            backgroundColor: Colors.black,
            appBar: AppBar(
              backgroundColor: Colors.black,
              title: const Text('PDF Document'),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            body: SfPdfViewer.file(
              file,
              onDocumentLoadFailed: (details) {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Failed to load PDF: ${details.error}'),
                    backgroundColor: Colors.red,
                  ),
                );
              },
            ),
          ),
        ),
      );
      return;
    }

    // For image files, show in dialog
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.black,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppBar(
              backgroundColor: Colors.black,
              title: const Text('Document Image'),
              leading: IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            Expanded(
              child: InteractiveViewer(
                minScale: 0.5,
                maxScale: 4.0,
                child: Center(
                  child: Image.file(
                    file,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.error, color: Colors.white, size: 48),
                            SizedBox(height: 16),
                            Text(
                              'Unable to load document',
                              style: TextStyle(color: Colors.white),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analysis Results'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        actions: [
          TextButton.icon(
            onPressed: () {
              // Navigate back to home, clearing the stack
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
            icon: const Icon(Icons.check_circle, color: Colors.white),
            label: const Text(
              'Done',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Flags'),
            Tab(text: 'Clauses'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildFlagsTab(),
          _buildClausesTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    final analysis = widget.document.analysis;
    final riskScore = analysis?.riskScore ?? 0.0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Document Info Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.description,
                        color: Theme.of(context).primaryColor,
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Document Information',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildInfoRow('Document:', widget.document.analysis?.documentTitle ?? widget.document.customTitle ?? widget.document.fileName),
                  _buildInfoRow('Scan Date:', DateFormat('MMM d, y - h:mm a').format(widget.document.scanDate)),
                  _buildInfoRow('Document Type:', widget.document.type.toString().split('.').last.toUpperCase()),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _viewDocument,
                      icon: const Icon(Icons.image),
                      label: const Text('View Document'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Risk Score Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.security,
                        color: _getRiskColor(riskScore),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Risk Assessment',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Signing Recommendation Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _getRecommendationColor(riskScore).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _getRecommendationColor(riskScore),
                        width: 2,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _getRecommendationIcon(riskScore),
                          color: _getRecommendationColor(riskScore),
                          size: 32,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _getSigningRecommendation(riskScore),
                            style: TextStyle(
                              color: _getRecommendationColor(riskScore),
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    children: [
                      Expanded(
                        child: LinearProgressIndicator(
                          value: riskScore / 10,
                          backgroundColor: Colors.grey[300],
                          valueColor: AlwaysStoppedAnimation<Color>(_getRiskColor(riskScore)),
                          minHeight: 8,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: _getRiskColor(riskScore).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          _getRiskText(riskScore),
                          style: TextStyle(
                            color: _getRiskColor(riskScore),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${riskScore.toStringAsFixed(1)}/10.0',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Summary Card
          if (analysis?.summary != null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.summarize,
                          color: Theme.of(context).primaryColor,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Summary',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      analysis!.summary,
                      style: const TextStyle(fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Quick Stats
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    _tabController.animateTo(1); // Navigate to Flags tab (index 1)
                  },
                  child: _buildStatCard(
                    'Flags Found',
                    '${analysis?.flags.length ?? 0}',
                    Icons.flag,
                    Colors.red,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    _tabController.animateTo(2); // Navigate to Clauses tab (index 2)
                  },
                  child: _buildStatCard(
                    'Key Clauses',
                    '${analysis?.importantClauses.length ?? 0}',
                    Icons.gavel,
                    Colors.blue,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Recommendations
          if (analysis?.recommendations.isNotEmpty == true) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.lightbulb,
                          color: Theme.of(context).primaryColor,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Recommendations',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...analysis!.recommendations.map((recommendation) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Icons.check_circle_outline,
                            size: 16,
                            color: Theme.of(context).primaryColor,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(recommendation),
                          ),
                        ],
                      ),
                    )),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Legal Disclaimer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.amber[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.amber[700]!, width: 2),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.warning_amber_rounded,
                      color: Colors.amber[900],
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Legal Disclaimer',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.amber[900],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'This analysis is provided for informational purposes only and does NOT constitute legal advice. SignaSure is not a substitute for professional legal counsel. Always consult with a qualified attorney before signing any legal document or making legal decisions.',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.amber[900],
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlagsTab() {
    final flags = widget.document.analysis?.flags ?? [];

    if (flags.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.check_circle,
              size: 80,
              color: Colors.green,
            ),
            SizedBox(height: 16),
            Text(
              'No Issues Found',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'This document appears to be free of major concerns.',
              style: TextStyle(fontSize: 16, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          margin: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.red[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.red[200]!),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: Colors.red[700], size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Flags are potential issues or concerning terms that may pose risks',
                  style: TextStyle(
                    color: Colors.red[900],
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: flags.length,
            itemBuilder: (context, index) {
              final flag = flags[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ExpansionTile(
                  leading: Icon(
                    _getSeverityIcon(flag.severity),
                    color: _getSeverityColor(flag.severity),
                  ),
                  title: Text(
                    flag.title,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(_getFlagTypeDisplayName(flag.type)),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Description:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text(flag.description),
                          const SizedBox(height: 16),
                          const Text(
                            'Highlighted Text:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.yellow[100],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.yellow[300]!),
                            ),
                            child: Text(
                              flag.highlightedText,
                              style: const TextStyle(fontStyle: FontStyle.italic),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildClausesTab() {
    final clauses = widget.document.analysis?.importantClauses ?? [];

    if (clauses.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.gavel,
              size: 80,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'No Key Clauses Identified',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          margin: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.blue[200]!),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: Colors.blue[700], size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Clauses are important terms you should understand, explained in plain English',
                  style: TextStyle(
                    color: Colors.blue[900],
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: clauses.length,
            itemBuilder: (context, index) {
              final clause = clauses[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ExpansionTile(
                  leading: Container(
                    width: 8,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _getImportanceColor(clause.importance),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  title: Text(
                    clause.title,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    'Importance: ${clause.importance.toString().split('.').last.toUpperCase()}',
                    style: TextStyle(color: _getImportanceColor(clause.importance)),
                  ),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Plain English Explanation:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.green[50],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.green[200]!),
                            ),
                            child: Text(
                              clause.simplifiedExplanation,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Original Legal Text:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey[300]!),
                            ),
                            child: Text(
                              clause.originalText,
                              style: const TextStyle(
                                fontSize: 14,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }


  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: const TextStyle(fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}