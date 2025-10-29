import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:provider/provider.dart';
import '../services/ocr_service.dart';
import '../services/ai_analysis_service.dart';
import '../services/auth_service.dart';
import '../services/database_service.dart';
import '../services/rate_limit_service.dart';
import '../models/document.dart';
import '../providers/theme_provider.dart';
import '../widgets/shimmer_loading.dart';
import 'analysis_result_screen.dart';

class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  bool _isProcessing = false;
  List<File> _selectedFiles = [];
  List<String> _fileNames = [];
  UsageStats? _usageStats;

  @override
  void initState() {
    super.initState();
    _loadUsageStats();
  }

  Future<void> _loadUsageStats() async {
    final stats = await RateLimitService.getUsageStats();
    if (mounted) {
      setState(() {
        _usageStats = stats;
      });
    }
  }

  Future<void> _pickFiles() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'txt', 'doc', 'docx'],
        allowMultiple: true,
      );

      if (result != null) {
        // Filter out files with null paths and validate files
        List<File> validFiles = [];
        List<String> validFileNames = [];

        for (var platformFile in result.files) {
          if (platformFile.path != null) {
            final file = File(platformFile.path!);
            // Verify the file exists and is readable
            if (await file.exists()) {
              validFiles.add(file);
              validFileNames.add(platformFile.name);
            } else {
              print('File does not exist: ${platformFile.path}');
            }
          } else {
            print('File path is null for: ${platformFile.name}');
            Fluttertoast.showToast(
              msg: "Cannot access file: ${platformFile.name}",
              toastLength: Toast.LENGTH_SHORT,
            );
          }
        }

        if (validFiles.isEmpty && result.files.isNotEmpty) {
          Fluttertoast.showToast(
            msg: "No valid files could be loaded",
            toastLength: Toast.LENGTH_SHORT,
          );
        }

        setState(() {
          _selectedFiles = validFiles;
          _fileNames = validFileNames;
        });
      }
    } catch (e) {
      print('Error picking file: $e');
      Fluttertoast.showToast(
        msg: "Error selecting file: $e",
        toastLength: Toast.LENGTH_SHORT,
      );
    }
  }

  void _removeFile(int index) {
    setState(() {
      _selectedFiles.removeAt(index);
      _fileNames.removeAt(index);
    });
  }

  Future<void> _processFiles() async {
    if (_selectedFiles.isEmpty) {
      Fluttertoast.showToast(
        msg: "Please select at least one file",
        toastLength: Toast.LENGTH_SHORT,
      );
      return;
    }

    try {
      setState(() {
        _isProcessing = true;
      });

      String combinedText = '';

      // Process all files
      for (int i = 0; i < _selectedFiles.length; i++) {
        final file = _selectedFiles[i];
        Fluttertoast.showToast(
          msg: "Processing file ${i + 1} of ${_selectedFiles.length}...",
          toastLength: Toast.LENGTH_SHORT,
        );

        // Extract text from file using OCR service
        final extractedText = await OCRService.extractTextFromFile(file);

        if (extractedText != null && extractedText.trim().isNotEmpty) {
          combinedText += '\n\n--- Page ${i + 1} ---\n\n$extractedText';
        }
      }

      if (combinedText.trim().isEmpty) {
        Fluttertoast.showToast(
          msg: "No text found in any of the files.",
          toastLength: Toast.LENGTH_LONG,
        );
        setState(() {
          _isProcessing = false;
        });
        return;
      }

      // Determine document type based on content
      final documentType = _determineDocumentType(combinedText);

      // Analyze document with AI FIRST (before saving to database)
      DocumentAnalysis? analysis;
      try {
        analysis = await AIAnalysisService.analyzeDocument(
          combinedText,
          documentType,
        );
      } on RateLimitException catch (e) {
        Fluttertoast.showToast(
          msg: e.message,
          toastLength: Toast.LENGTH_LONG,
          backgroundColor: Colors.orange,
        );
        setState(() => _isProcessing = false);
        await _loadUsageStats();  // Reload stats after rate limit error
        return;
      } on AIAnalysisException catch (e) {
        Fluttertoast.showToast(
          msg: e.message,
          toastLength: Toast.LENGTH_LONG,
          backgroundColor: Colors.red,
        );
        setState(() => _isProcessing = false);
        return;
      }

      if (analysis == null) {
        Fluttertoast.showToast(
          msg: "AI analysis failed. Please try again later.",
          toastLength: Toast.LENGTH_LONG,
        );
        setState(() {
          _isProcessing = false;
        });
        return;
      }

      // Only save file and create document AFTER successful AI analysis
      final directory = await getApplicationDocumentsDirectory();
      final fileName = _selectedFiles.length > 1
          ? 'document_${DateTime.now().millisecondsSinceEpoch}_${_selectedFiles.length}_pages'
          : 'document_${DateTime.now().millisecondsSinceEpoch}_${_fileNames[0]}';
      final savedFile = File('${directory.path}/$fileName');
      await _selectedFiles[0].copy(savedFile.path);

      // Create document record with analysis
      final document = Document(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        filePath: savedFile.path,
        fileName: fileName,
        scanDate: DateTime.now(),
        type: documentType,
        extractedText: combinedText,
        analysis: analysis,
      );

      // Save to database with user ID
      final userId = AuthService().currentUser?.uid ?? '';
      await DatabaseService.insertDocument(document, userId);

      // Navigate to analysis result screen
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AnalysisResultScreen(document: document),
          ),
        );
      }

      // Reset state and reload usage stats
      setState(() {
        _selectedFiles.clear();
        _fileNames.clear();
      });

      // Reload usage stats after successful analysis
      await _loadUsageStats();

      Fluttertoast.showToast(
        msg: "Documents uploaded and analyzed successfully!",
        toastLength: Toast.LENGTH_SHORT,
      );
    } catch (e) {
      print('Error processing file: $e');
      Fluttertoast.showToast(
        msg: "Error processing document: $e",
        toastLength: Toast.LENGTH_LONG,
      );
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  DocumentType _determineDocumentType(String text) {
    final lowerText = text.toLowerCase();

    if (lowerText.contains('employment') ||
        lowerText.contains('job') ||
        lowerText.contains('salary') ||
        lowerText.contains('employee')) {
      return DocumentType.employment;
    } else if (lowerText.contains('lease') ||
               lowerText.contains('rent') ||
               lowerText.contains('tenant') ||
               lowerText.contains('landlord')) {
      return DocumentType.lease;
    } else if (lowerText.contains('loan') ||
               lowerText.contains('interest') ||
               lowerText.contains('principal') ||
               lowerText.contains('borrower')) {
      return DocumentType.loan;
    } else if (lowerText.contains('insurance') ||
               lowerText.contains('policy') ||
               lowerText.contains('premium') ||
               lowerText.contains('coverage')) {
      return DocumentType.insurance;
    } else if (lowerText.contains('contract') ||
               lowerText.contains('agreement') ||
               lowerText.contains('terms') ||
               lowerText.contains('conditions')) {
      return DocumentType.contract;
    }

    return DocumentType.other;
  }

  String _getFileIcon(String? fileName) {
    if (fileName == null) return '📄';

    final extension = fileName.toLowerCase().split('.').last;
    switch (extension) {
      case 'pdf':
        return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📄';
      default:
        return '📄';
    }
  }

  double _getFileSizeInMB(File file) {
    try {
      if (file.existsSync()) {
        final bytes = file.lengthSync();
        return bytes / (1024 * 1024);
      }
      return 0.0;
    } catch (e) {
      print('Error getting file size: $e');
      return 0.0;
    }
  }

  double _getTotalSizeInMB() {
    double total = 0;
    for (var file in _selectedFiles) {
      total += _getFileSizeInMB(file);
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth * 0.05;
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: isDark ? Colors.white : Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Upload Document',
          style: TextStyle(
            color: isDark ? Colors.white : Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        backgroundColor: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
        elevation: 0,
      ),
      body: _isProcessing
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SpinKitCircle(
                    color: Colors.blue,
                    size: 50.0,
                  ),
                  const SizedBox(height: 30),
                  ShimmerLoading(
                    isLoading: true,
                    child: Column(
                      children: [
                        ShimmerBox(
                          width: screenWidth * 0.6,
                          height: 20,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        const SizedBox(height: 12),
                        ShimmerBox(
                          width: screenWidth * 0.4,
                          height: 16,
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Processing document...',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            )
          : SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Upload icon and title
                    Container(
                      padding: const EdgeInsets.all(30),
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
                        children: [
                          Icon(
                            Icons.cloud_upload_outlined,
                            size: 80,
                            color: Theme.of(context).primaryColor,
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Upload Your Document',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              color: isDark ? Colors.white : Colors.black,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Select a document file to analyze for\npotential issues and loopholes',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Supported file types
                    Container(
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
                          Text(
                            'Supported File Types',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: isDark ? Colors.white : Colors.black,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              _buildFileTypeChip('PDF'),
                              _buildFileTypeChip('JPG'),
                              _buildFileTypeChip('PNG'),
                              _buildFileTypeChip('TXT'),
                              _buildFileTypeChip('DOC'),
                              _buildFileTypeChip('DOCX'),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Usage Stats
                    if (_usageStats != null) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: isDark
                                ? [const Color(0xFF252525), const Color(0xFF2A2A2A)]
                                : [Colors.white, Colors.grey[50]!],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(isDark ? 0.3 : 0.08),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.analytics_outlined,
                              color: _usageStats!.remainingThisHour > 5
                                  ? Colors.green
                                  : (_usageStats!.remainingThisHour > 2 ? Colors.orange : Colors.red),
                              size: 24,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'AI Analyses Available',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: isDark ? Colors.white : Colors.black,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${_usageStats!.remainingThisHour} left this hour • ${_usageStats!.remainingToday} left today',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],

                    // Selected files info
                    if (_selectedFiles.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: isDark
                                ? [const Color(0xFF252525), const Color(0xFF2A2A2A)]
                                : [Colors.white, Colors.grey[50]!],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark
                                ? const Color(0xFF3B82F6)
                                : const Color(0xFF2563EB),
                            width: 2,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.description,
                                  color: isDark ? const Color(0xFF3B82F6) : const Color(0xFF2563EB),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    '${_selectedFiles.length} file${_selectedFiles.length > 1 ? 's' : ''} selected',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 16,
                                      color: isDark ? Colors.white : Colors.black,
                                    ),
                                  ),
                                ),
                                Text(
                                  '${_getTotalSizeInMB().toStringAsFixed(2)} MB',
                                  style: TextStyle(
                                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            ...List.generate(
                              _selectedFiles.length,
                              (index) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2563EB).withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Icon(
                                        Icons.insert_drive_file,
                                        size: 20,
                                        color: isDark ? const Color(0xFF3B82F6) : const Color(0xFF2563EB),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            _fileNames[index],
                                            style: TextStyle(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 13,
                                              color: isDark ? Colors.white : Colors.black,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          Text(
                                            '${_getFileSizeInMB(_selectedFiles[index]).toStringAsFixed(2)} MB',
                                            style: TextStyle(
                                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    IconButton(
                                      onPressed: () => _removeFile(index),
                                      icon: Icon(
                                        Icons.close,
                                        size: 18,
                                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                                      ),
                                      padding: const EdgeInsets.all(4),
                                      constraints: const BoxConstraints(),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],

                    const SizedBox(height: 20),

                    // Action buttons
                    if (_selectedFiles.isEmpty)
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton.icon(
                          onPressed: _pickFiles,
                          icon: const Icon(Icons.folder_open),
                          label: const Text(
                            'Select Files',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                        ),
                      )
                    else
                      Column(
                        children: [
                          SizedBox(
                            width: double.infinity,
                            height: 54,
                            child: ElevatedButton.icon(
                              onPressed: _processFiles,
                              icon: const Icon(Icons.analytics),
                              label: Text(
                                'Analyze ${_selectedFiles.length > 1 ? 'Documents' : 'Document'}',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            height: 54,
                            child: OutlinedButton.icon(
                              onPressed: _pickFiles,
                              icon: const Icon(Icons.add),
                              label: const Text(
                                'Add More Files',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                              ),
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(
                                  color: Theme.of(context).primaryColor,
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildFileTypeChip(String type) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF2563EB).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        type,
        style: const TextStyle(
          fontSize: 12,
          color: Color(0xFF2563EB),
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}