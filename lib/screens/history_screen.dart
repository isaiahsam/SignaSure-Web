import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/database_service.dart';
import '../models/document.dart';
import '../providers/theme_provider.dart';
import 'analysis_result_screen.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Document> _documents = [];
  bool _isLoading = true;
  String _searchQuery = '';
  DocumentType? _selectedFilter;

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    try {
      setState(() {
        _isLoading = true;
      });

      final documents = await DatabaseService.getAllDocuments();
      setState(() {
        _documents = documents;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading documents: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  List<Document> get _filteredDocuments {
    List<Document> filtered = _documents;

    // Apply type filter
    if (_selectedFilter != null) {
      filtered = filtered.where((doc) => doc.type == _selectedFilter).toList();
    }

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((doc) {
        return doc.fileName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
               (doc.extractedText?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false);
      }).toList();
    }

    // Sort: favorites first, then by date
    filtered.sort((a, b) {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.scanDate.compareTo(a.scanDate);
    });

    return filtered;
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

  IconData _getDocumentTypeIcon(DocumentType type) {
    switch (type) {
      case DocumentType.contract:
        return Icons.description;
      case DocumentType.lease:
        return Icons.home;
      case DocumentType.loan:
        return Icons.account_balance;
      case DocumentType.insurance:
        return Icons.security;
      case DocumentType.employment:
        return Icons.work;
      default:
        return Icons.insert_drive_file;
    }
  }

  String _getDocumentTypeName(DocumentType type) {
    switch (type) {
      case DocumentType.contract:
        return 'Contract';
      case DocumentType.lease:
        return 'Lease';
      case DocumentType.loan:
        return 'Loan';
      case DocumentType.insurance:
        return 'Insurance';
      case DocumentType.employment:
        return 'Employment';
      default:
        return 'Other';
    }
  }

  Future<void> _deleteDocument(Document document) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Document'),
        content: Text('Are you sure you want to delete "${document.fileName}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await DatabaseService.deleteDocument(document.id);
      _loadDocuments();
    }
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter by Document Type'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('All Types'),
              leading: Radio<DocumentType?>(
                value: null,
                groupValue: _selectedFilter,
                onChanged: (value) {
                  setState(() {
                    _selectedFilter = value;
                  });
                  Navigator.pop(context);
                },
              ),
            ),
            ...DocumentType.values.map((type) => ListTile(
              title: Text(_getDocumentTypeName(type)),
              leading: Radio<DocumentType?>(
                value: type,
                groupValue: _selectedFilter,
                onChanged: (value) {
                  setState(() {
                    _selectedFilter = value;
                  });
                  Navigator.pop(context);
                },
              ),
            )),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth * 0.05;
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'SignaSure',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: isDark ? const Color(0xFF3B82F6) : const Color(0xFF2563EB),
                      letterSpacing: -0.5,
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: Icon(
                      Icons.arrow_back,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                    iconSize: 28,
                  ),
                ],
              ),
            ),

            // History content container
            Expanded(
              child: Container(
                margin: EdgeInsets.symmetric(horizontal: horizontalPadding),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: isDark
                        ? [const Color(0xFF252525), const Color(0xFF2A2A2A)]
                        : [Colors.white, Colors.grey[50]!],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDark ? 0.3 : 0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      'History',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: isDark ? Colors.white : Colors.black,
                        letterSpacing: -0.3,
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Search bar
                    Container(
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: TextField(
                        style: TextStyle(
                          color: isDark ? Colors.white : Colors.black,
                          fontWeight: FontWeight.w600,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Search',
                          hintStyle: TextStyle(
                            color: isDark ? Colors.grey[500] : Colors.grey[600],
                            fontWeight: FontWeight.w600,
                          ),
                          prefixIcon: Icon(
                            Icons.menu,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                          suffixIcon: Icon(
                            Icons.search,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        onChanged: (value) {
                          setState(() {
                            _searchQuery = value;
                          });
                        },
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Documents list
                    Expanded(
                      child: _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : _filteredDocuments.isEmpty
                              ? Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.history,
                                        size: 60,
                                        color: Colors.grey[400],
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        _documents.isEmpty
                                            ? 'No documents yet'
                                            : 'No matching documents',
                                        style: TextStyle(
                                          fontSize: 16,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              : RefreshIndicator(
                                  onRefresh: _loadDocuments,
                                  child: ListView.builder(
                                    padding: EdgeInsets.zero,
                                    itemCount: _filteredDocuments.length,
                                    itemBuilder: (context, index) {
                                      final document = _filteredDocuments[index];
                                      return _buildDocumentItem(context, document);
                                    },
                                  ),
                                ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Bottom navigation hint
            Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDocumentItem(BuildContext context, Document document) {
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final isDark = themeProvider.isDarkMode;

    return GestureDetector(
      onTap: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AnalysisResultScreen(document: document),
          ),
        );
        _loadDocuments(); // Reload after returning
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            // Document thumbnail
            Container(
              width: 65,
              height: 85,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDark
                      ? [const Color(0xFF2A2A2A), const Color(0xFF252525)]
                      : [Colors.white, Colors.grey[100]!],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? Colors.grey[800]! : Colors.grey[300]!,
                  width: 1.5,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.description,
                    size: 28,
                    color: isDark ? const Color(0xFF3B82F6) : const Color(0xFF2563EB),
                  ),
                  const SizedBox(height: 6),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: Text(
                      'DOC',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 12),

            // Document details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          document.displayTitle.length > 20
                              ? '${document.displayTitle.substring(0, 20)}...'
                              : document.displayTitle,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: isDark ? Colors.white : Colors.black,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          Icons.edit,
                          size: 18,
                          color: isDark ? const Color(0xFF3B82F6) : const Color(0xFF2563EB),
                        ),
                        onPressed: () => _showTitleEditDialog(context, document),
                        padding: const EdgeInsets.all(4),
                        constraints: const BoxConstraints(),
                        tooltip: 'Edit name',
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    document.analysis?.summary.substring(
                          0,
                          document.analysis!.summary.length > 80
                              ? 80
                              : document.analysis!.summary.length,
                        ) ??
                        'No summary available',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                      height: 1.5,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            // Actions without colored backgrounds
            Column(
              children: [
                IconButton(
                  icon: Icon(
                    document.isFavorite ? Icons.star : Icons.star_border,
                    size: 22,
                    color: const Color(0xFFFFA500),
                  ),
                  onPressed: () async {
                    await DatabaseService.toggleFavorite(document.id, !document.isFavorite);
                    _loadDocuments();
                  },
                  padding: const EdgeInsets.all(8),
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(height: 8),
                IconButton(
                  icon: const Icon(
                    Icons.delete_outline,
                    size: 22,
                    color: Colors.red,
                  ),
                  onPressed: () => _deleteDocument(document),
                  padding: const EdgeInsets.all(8),
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showTitleEditDialog(BuildContext context, Document document) async {
    final controller = TextEditingController(text: document.customTitle ?? document.fileName);
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final isDark = themeProvider.isDarkMode;

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF252525) : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: Text(
          'Edit Title',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        content: TextField(
          controller: controller,
          autofocus: true,
          style: TextStyle(
            color: isDark ? Colors.white : Colors.black,
            fontWeight: FontWeight.w600,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              await DatabaseService.updateTitle(
                document.id,
                controller.text.isEmpty ? null : controller.text,
              );
              Navigator.pop(context);
              _loadDocuments();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Save',
              style: TextStyle(
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}