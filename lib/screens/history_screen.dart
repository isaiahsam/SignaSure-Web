import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/database_service.dart';
import '../models/document.dart';
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

    return filtered;
  }

  Color _getRiskColor(double riskScore) {
    if (riskScore <= 3) return Colors.green;
    if (riskScore <= 6) return Colors.orange;
    return Colors.red;
  }

  String _getRiskText(double riskScore) {
    if (riskScore <= 3) return 'Low Risk';
    if (riskScore <= 6) return 'Medium Risk';
    return 'High Risk';
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Document History'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            onPressed: _showFilterDialog,
            icon: const Icon(Icons.filter_list),
          ),
          IconButton(
            onPressed: _loadDocuments,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search documents...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
            ),
          ),

          // Filter indicator
          if (_selectedFilter != null)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Chip(
                    label: Text('Filter: ${_getDocumentTypeName(_selectedFilter!)}'),
                    deleteIcon: const Icon(Icons.close),
                    onDeleted: () {
                      setState(() {
                        _selectedFilter = null;
                      });
                    },
                  ),
                ],
              ),
            ),

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
                              size: 80,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 20),
                            Text(
                              _documents.isEmpty
                                  ? 'No documents scanned yet'
                                  : 'No documents match your search',
                              style: const TextStyle(
                                fontSize: 18,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              _documents.isEmpty
                                  ? 'Start by scanning or uploading a document'
                                  : 'Try adjusting your search or filter',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadDocuments,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _filteredDocuments.length,
                          itemBuilder: (context, index) {
                            final document = _filteredDocuments[index];
                            final riskScore = document.analysis?.riskScore ?? 0.0;

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(16),
                                leading: CircleAvatar(
                                  backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                                  child: Icon(
                                    _getDocumentTypeIcon(document.type),
                                    color: Theme.of(context).primaryColor,
                                  ),
                                ),
                                title: Text(
                                  document.fileName,
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.calendar_today,
                                          size: 14,
                                          color: Colors.grey[600],
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          DateFormat('MMM d, y').format(document.scanDate),
                                          style: TextStyle(color: Colors.grey[600]),
                                        ),
                                        const SizedBox(width: 16),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 2,
                                          ),
                                          decoration: BoxDecoration(
                                            color: _getRiskColor(riskScore).withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            _getRiskText(riskScore),
                                            style: TextStyle(
                                              color: _getRiskColor(riskScore),
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _getDocumentTypeName(document.type),
                                      style: TextStyle(
                                        color: Colors.grey[600],
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                                trailing: PopupMenuButton(
                                  itemBuilder: (context) => [
                                    const PopupMenuItem(
                                      value: 'view',
                                      child: Row(
                                        children: [
                                          Icon(Icons.visibility),
                                          SizedBox(width: 8),
                                          Text('View Analysis'),
                                        ],
                                      ),
                                    ),
                                    const PopupMenuItem(
                                      value: 'delete',
                                      child: Row(
                                        children: [
                                          Icon(Icons.delete, color: Colors.red),
                                          SizedBox(width: 8),
                                          Text('Delete', style: TextStyle(color: Colors.red)),
                                        ],
                                      ),
                                    ),
                                  ],
                                  onSelected: (value) {
                                    if (value == 'view') {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => AnalysisResultScreen(document: document),
                                        ),
                                      );
                                    } else if (value == 'delete') {
                                      _deleteDocument(document);
                                    }
                                  },
                                ),
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => AnalysisResultScreen(document: document),
                                    ),
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}