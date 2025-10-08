import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:path_provider/path_provider.dart';
import '../providers/theme_provider.dart';
import '../services/ocr_service.dart';
import '../services/ai_analysis_service.dart';
import '../services/database_service.dart';
import '../models/document.dart';
import 'analysis_result_screen.dart';

class ImageReviewScreen extends StatefulWidget {
  final List<File> capturedImages;

  const ImageReviewScreen({
    super.key,
    required this.capturedImages,
  });

  @override
  State<ImageReviewScreen> createState() => _ImageReviewScreenState();
}

class _ImageReviewScreenState extends State<ImageReviewScreen> {
  late List<File> _images;
  bool _isProcessing = false;
  int _currentPage = 0;
  final PageController _pageController = PageController();

  @override
  void initState() {
    super.initState();
    _images = List.from(widget.capturedImages);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _removeImage(int index) {
    if (_images.length == 1) {
      Fluttertoast.showToast(
        msg: "You need at least one image",
        toastLength: Toast.LENGTH_SHORT,
      );
      return;
    }

    setState(() {
      _images.removeAt(index);
      if (_currentPage >= _images.length) {
        _currentPage = _images.length - 1;
        _pageController.jumpToPage(_currentPage);
      }
    });

    Fluttertoast.showToast(
      msg: "Image removed",
      toastLength: Toast.LENGTH_SHORT,
    );
  }

  Future<void> _processImages() async {
    try {
      setState(() {
        _isProcessing = true;
      });

      String combinedText = '';

      // Extract text from all captured pages
      for (int i = 0; i < _images.length; i++) {
        final extractedText = await OCRService.extractTextFromImage(_images[i].path);

        if (extractedText != null && extractedText.trim().isNotEmpty) {
          if (_images.length > 1) {
            combinedText += '\n\n--- Page ${i + 1} ---\n\n$extractedText';
          } else {
            combinedText = extractedText;
          }
        }
      }

      if (combinedText.trim().isEmpty) {
        Fluttertoast.showToast(
          msg: "No text found in the images. Please try again with clearer images.",
          toastLength: Toast.LENGTH_LONG,
        );
        setState(() {
          _isProcessing = false;
        });
        return;
      }

      // Save images to app directory
      final directory = await getApplicationDocumentsDirectory();
      final fileName = _images.length > 1
          ? 'document_${DateTime.now().millisecondsSinceEpoch}_${_images.length}_pages.jpg'
          : 'document_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final savedFile = File('${directory.path}/$fileName');
      await _images[0].copy(savedFile.path);

      // Create document record
      final document = Document(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        filePath: savedFile.path,
        fileName: fileName,
        scanDate: DateTime.now(),
        type: DocumentType.other,
        extractedText: combinedText,
      );

      // Save to database
      await DatabaseService.insertDocument(document);

      // Analyze document with AI
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
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => AnalysisResultScreen(document: updatedDocument),
          ),
        );
      }

      Fluttertoast.showToast(
        msg: "Document scanned and analyzed successfully!",
        toastLength: Toast.LENGTH_SHORT,
      );
    } catch (e) {
      print('Error processing images: $e');
      Fluttertoast.showToast(
        msg: "Error processing document: $e",
        toastLength: Toast.LENGTH_LONG,
      );
      setState(() {
        _isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
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
          'Review Images',
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
                  SpinKitCircle(
                    color: Theme.of(context).primaryColor,
                    size: 50.0,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Processing ${_images.length} page${_images.length > 1 ? 's' : ''}...',
                    style: TextStyle(
                      fontSize: 16,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                // Image counter
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'Page ${_currentPage + 1} of ${_images.length}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                  ),
                ),

                // Image viewer
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    itemCount: _images.length,
                    onPageChanged: (index) {
                      setState(() {
                        _currentPage = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.05),
                        child: Column(
                          children: [
                            Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.black,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.2),
                                      blurRadius: 8,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.file(
                                    _images[index],
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () => _removeImage(index),
                              icon: const Icon(Icons.delete_outline),
                              label: const Text('Remove this page'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // Page indicators
                if (_images.length > 1)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _images.length,
                        (index) => Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _currentPage == index
                                ? const Color(0xFF2563EB)
                                : Colors.grey[400],
                          ),
                        ),
                      ),
                    ),
                  ),

                // Bottom button
                Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: screenWidth * 0.05,
                    vertical: 20,
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _processImages,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 3,
                      ),
                      child: const Text(
                        'Analyze Document',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
