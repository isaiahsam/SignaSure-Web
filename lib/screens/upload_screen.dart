import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../services/ocr_service.dart';
import '../services/ai_analysis_service.dart';
import '../services/database_service.dart';
import '../models/document.dart';
import 'analysis_result_screen.dart';

class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  bool _isProcessing = false;
  File? _selectedFile;
  String? _fileName;

  Future<void> _pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'txt', 'doc', 'docx'],
        allowMultiple: false,
      );

      if (result != null) {
        setState(() {
          _selectedFile = File(result.files.single.path!);
          _fileName = result.files.single.name;
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

  Future<void> _processFile() async {
    if (_selectedFile == null) {
      Fluttertoast.showToast(
        msg: "Please select a file first",
        toastLength: Toast.LENGTH_SHORT,
      );
      return;
    }

    try {
      setState(() {
        _isProcessing = true;
      });

      // Extract text from file using OCR service
      final extractedText = await OCRService.extractTextFromFile(_selectedFile!);

      if (extractedText == null || extractedText.trim().isEmpty) {
        Fluttertoast.showToast(
          msg: "No text found in the file. Please try again with a different file.",
          toastLength: Toast.LENGTH_LONG,
        );
        return;
      }

      // Save file to app directory
      final directory = await getApplicationDocumentsDirectory();
      final fileName = 'document_${DateTime.now().millisecondsSinceEpoch}_$_fileName';
      final savedFile = File('${directory.path}/$fileName');
      await _selectedFile!.copy(savedFile.path);

      // Determine document type based on content
      final documentType = _determineDocumentType(extractedText);

      // Create document record
      final document = Document(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        filePath: savedFile.path,
        fileName: fileName,
        scanDate: DateTime.now(),
        type: documentType,
        extractedText: extractedText,
      );

      // Save to database
      await DatabaseService.insertDocument(document);

      // Analyze document with AI (mock for now)
      final analysis = await AIAnalysisService.getMockAnalysis();

      // Update document with analysis
      final updatedDocument = Document(
        id: document.id,
        filePath: document.filePath,
        fileName: document.fileName,
        scanDate: document.scanDate,
        type: document.type,
        extractedText: document.extractedText,
        analysis: analysis,
      );

      await DatabaseService.updateDocument(updatedDocument);

      // Navigate to analysis result screen
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AnalysisResultScreen(document: updatedDocument),
          ),
        );
      }

      // Reset state
      setState(() {
        _selectedFile = null;
        _fileName = null;
      });

      Fluttertoast.showToast(
        msg: "Document uploaded and analyzed successfully!",
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
    final bytes = file.lengthSync();
    return bytes / (1024 * 1024);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Document'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
      body: _isProcessing
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SpinKitCircle(
                    color: Colors.blue,
                    size: 50.0,
                  ),
                  SizedBox(height: 20),
                  Text(
                    'Processing document...',
                    style: TextStyle(fontSize: 16),
                  ),
                ],
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          Icon(
                            Icons.cloud_upload,
                            size: 80,
                            color: Theme.of(context).primaryColor,
                          ),
                          const SizedBox(height: 20),
                          const Text(
                            'Upload Your Document',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Select a document file to analyze for potential issues and loopholes',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Supported file types
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Supported File Types:',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 10,
                            runSpacing: 5,
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
                  ),
                  const SizedBox(height: 30),

                  // Selected file info
                  if (_selectedFile != null) ...[
                    Card(
                      color: Colors.green[50],
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Text(
                              _getFileIcon(_fileName),
                              style: const TextStyle(fontSize: 24),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _fileName ?? 'Unknown file',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    '${_getFileSizeInMB(_selectedFile!).toStringAsFixed(2)} MB',
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              onPressed: () {
                                setState(() {
                                  _selectedFile = null;
                                  _fileName = null;
                                });
                              },
                              icon: const Icon(Icons.close),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  const Spacer(),

                  // Action buttons
                  if (_selectedFile == null)
                    ElevatedButton.icon(
                      onPressed: _pickFile,
                      icon: const Icon(Icons.folder_open),
                      label: const Text('Select File'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.all(16),
                      ),
                    )
                  else
                    Column(
                      children: [
                        ElevatedButton.icon(
                          onPressed: _processFile,
                          icon: const Icon(Icons.analytics),
                          label: const Text('Analyze Document'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.all(16),
                          ),
                        ),
                        const SizedBox(height: 10),
                        OutlinedButton.icon(
                          onPressed: _pickFile,
                          icon: const Icon(Icons.folder_open),
                          label: const Text('Select Different File'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.all(16),
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildFileTypeChip(String type) {
    return Chip(
      label: Text(
        type,
        style: const TextStyle(fontSize: 12),
      ),
      backgroundColor: Colors.blue[50],
      labelStyle: TextStyle(color: Colors.blue[700]),
    );
  }
}