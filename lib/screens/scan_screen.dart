import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:path_provider/path_provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:provider/provider.dart';
import '../services/ocr_service.dart';
import '../services/ai_analysis_service.dart';
import '../services/database_service.dart';
import '../models/document.dart';
import '../providers/theme_provider.dart';
import 'image_review_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isCameraInitialized = false;
  bool _isProcessing = false;
  bool _isFlashOn = false;
  bool _showCaptureFlash = false;
  final ImagePicker _imagePicker = ImagePicker();
  List<File> _capturedPages = [];
  List<String> _extractedTexts = [];

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      final cameraPermission = await Permission.camera.request();
      if (cameraPermission != PermissionStatus.granted) {
        _showPermissionDialog();
        return;
      }

      _cameras = await availableCameras();
      if (_cameras!.isNotEmpty) {
        _cameraController = CameraController(
          _cameras![0],
          ResolutionPreset.high,
          enableAudio: false,
        );

        await _cameraController!.initialize();
        if (mounted) {
          setState(() {
            _isCameraInitialized = true;
          });
        }
      }
    } catch (e) {
      print('Error initializing camera: $e');
      if (mounted) {
        Fluttertoast.showToast(
          msg: "Error initializing camera: $e",
          toastLength: Toast.LENGTH_LONG,
        );
      }
    }
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Camera Permission Required'),
        content: const Text('This app needs camera permission to scan documents.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              openAppSettings();
            },
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );
  }

  Future<void> _capturePhoto() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    try {
      // Show visual feedback
      setState(() {
        _showCaptureFlash = true;
      });

      final XFile photo = await _cameraController!.takePicture();
      final capturedFile = File(photo.path);

      setState(() {
        _capturedPages.add(capturedFile);
      });

      // Hide flash after brief delay
      await Future.delayed(const Duration(milliseconds: 200));
      if (mounted) {
        setState(() {
          _showCaptureFlash = false;
        });
      }

      Fluttertoast.showToast(
        msg: "Page ${_capturedPages.length} captured!",
        toastLength: Toast.LENGTH_SHORT,
      );
    } catch (e) {
      print('Error capturing photo: $e');
      setState(() {
        _showCaptureFlash = false;
      });
      Fluttertoast.showToast(
        msg: "Error capturing photo: $e",
        toastLength: Toast.LENGTH_SHORT,
      );
    }
  }

  Future<void> _pickFromGallery() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 100,
      );

      if (image != null) {
        setState(() {
          _capturedPages.add(File(image.path));
        });

        Fluttertoast.showToast(
          msg: "Page ${_capturedPages.length} added!",
          toastLength: Toast.LENGTH_SHORT,
        );
      }
    } catch (e) {
      print('Error picking image from gallery: $e');
      Fluttertoast.showToast(
        msg: "Error picking image: $e",
        toastLength: Toast.LENGTH_SHORT,
      );
    }
  }

  Future<void> _processAllPages() async {
    if (_capturedPages.isEmpty) {
      Fluttertoast.showToast(
        msg: "Please capture at least one page",
        toastLength: Toast.LENGTH_SHORT,
      );
      return;
    }

    // Navigate to review screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ImageReviewScreen(capturedImages: _capturedPages),
      ),
    );
  }

  void _removeLastPage() {
    if (_capturedPages.isNotEmpty) {
      setState(() {
        _capturedPages.removeLast();
        if (_extractedTexts.isNotEmpty) {
          _extractedTexts.removeLast();
        }
      });

      Fluttertoast.showToast(
        msg: "Last page removed",
        toastLength: Toast.LENGTH_SHORT,
      );
    }
  }


  Future<void> _toggleFlash() async {
    if (_cameraController == null || !_isCameraInitialized) return;

    try {
      setState(() {
        _isFlashOn = !_isFlashOn;
      });

      await _cameraController!.setFlashMode(
        _isFlashOn ? FlashMode.torch : FlashMode.off,
      );
    } catch (e) {
      print('Error toggling flash: $e');
      setState(() {
        _isFlashOn = !_isFlashOn; // Revert on error
      });
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode;

    // A4 aspect ratio is 1:1.414 (width:height)
    // Make the frame responsive but maintain A4 proportions
    final frameWidth = screenWidth * 0.85;
    final frameHeight = frameWidth * 1.414;

    // Ensure frame fits on screen with some padding
    final maxFrameHeight = screenHeight * 0.6;
    final adjustedFrameHeight = frameHeight > maxFrameHeight ? maxFrameHeight : frameHeight;
    final adjustedFrameWidth = adjustedFrameHeight / 1.414;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: isDark ? Colors.white : Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Scan Document',
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
                  const Text(
                    'Processing document...',
                    style: TextStyle(fontSize: 16, color: Colors.black87),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: _isCameraInitialized
                      ? Stack(
                          children: [
                            // Camera preview
                            Positioned.fill(
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(0),
                                child: CameraPreview(_cameraController!),
                              ),
                            ),

                            // Capture flash effect
                            if (_showCaptureFlash)
                              Positioned.fill(
                                child: Container(
                                  color: Colors.white,
                                ),
                              ),

                            // Dark overlay outside the frame
                            Positioned.fill(
                              child: CustomPaint(
                                painter: DocumentFramePainter(
                                  frameWidth: adjustedFrameWidth,
                                  frameHeight: adjustedFrameHeight,
                                ),
                              ),
                            ),

                            // Instructions at top - positioned higher to avoid overlap
                            Positioned(
                              top: 20,
                              left: 0,
                              right: 0,
                              child: Center(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    _capturedPages.isEmpty
                                        ? 'Position document within frame'
                                        : '${_capturedPages.length} page${_capturedPages.length > 1 ? 's' : ''} captured',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                            ),

                            // Corner markers for better visual guidance
                            Center(
                              child: SizedBox(
                                width: adjustedFrameWidth,
                                height: adjustedFrameHeight,
                                child: Stack(
                                  children: [
                                    // Top-left corner
                                    Positioned(
                                      top: 0,
                                      left: 0,
                                      child: _buildCornerMarker(true, true),
                                    ),
                                    // Top-right corner
                                    Positioned(
                                      top: 0,
                                      right: 0,
                                      child: _buildCornerMarker(true, false),
                                    ),
                                    // Bottom-left corner
                                    Positioned(
                                      bottom: 0,
                                      left: 0,
                                      child: _buildCornerMarker(false, true),
                                    ),
                                    // Bottom-right corner
                                    Positioned(
                                      bottom: 0,
                                      right: 0,
                                      child: _buildCornerMarker(false, false),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        )
                      : Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.camera_alt,
                                size: 80,
                                color: Colors.grey[400],
                              ),
                              const SizedBox(height: 20),
                              const Text(
                                'Initializing camera...',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.black87,
                                ),
                              ),
                            ],
                          ),
                        ),
                ),

                // Bottom controls
                Container(
                  color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
                  padding: EdgeInsets.symmetric(
                    horizontal: screenWidth * 0.05,
                    vertical: 20,
                  ),
                  child: _capturedPages.isEmpty
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildControlButton(
                              icon: Icons.photo_library,
                              label: 'Gallery',
                              onPressed: _pickFromGallery,
                            ),
                            _buildCaptureButton(
                              onPressed: _isCameraInitialized ? _capturePhoto : null,
                            ),
                            _buildControlButton(
                              icon: _isFlashOn ? Icons.flash_on : Icons.flash_off,
                              label: 'Flash',
                              onPressed: _toggleFlash,
                            ),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildControlButton(
                              icon: Icons.delete_outline,
                              label: 'Remove',
                              onPressed: _removeLastPage,
                            ),
                            _buildCaptureButton(
                              onPressed: _isCameraInitialized ? _capturePhoto : null,
                            ),
                            _buildControlButton(
                              icon: Icons.check,
                              label: 'Done',
                              onPressed: _processAllPages,
                            ),
                          ],
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildCornerMarker(bool isTop, bool isLeft) {
    return Container(
      width: 30,
      height: 30,
      decoration: BoxDecoration(
        border: Border(
          top: isTop
              ? const BorderSide(color: Color(0xFF2563EB), width: 4)
              : BorderSide.none,
          left: isLeft
              ? const BorderSide(color: Color(0xFF2563EB), width: 4)
              : BorderSide.none,
          bottom: !isTop
              ? const BorderSide(color: Color(0xFF2563EB), width: 4)
              : BorderSide.none,
          right: !isLeft
              ? const BorderSide(color: Color(0xFF2563EB), width: 4)
              : BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: IconButton(
            onPressed: onPressed,
            icon: Icon(icon, size: 24),
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[700],
          ),
        ),
      ],
    );
  }

  Widget _buildCaptureButton({required VoidCallback? onPressed}) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 70,
          height: 70,
          decoration: BoxDecoration(
            color: const Color(0xFF2563EB),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF2563EB).withOpacity(0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: IconButton(
            onPressed: onPressed,
            icon: const Icon(Icons.camera_alt, size: 32),
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Capture',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[700],
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

// Custom painter for the document frame overlay
class DocumentFramePainter extends CustomPainter {
  final double frameWidth;
  final double frameHeight;

  DocumentFramePainter({
    required this.frameWidth,
    required this.frameHeight,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black.withOpacity(0.5)
      ..style = PaintingStyle.fill;

    final centerX = size.width / 2;
    final centerY = size.height / 2;
    final frameLeft = centerX - (frameWidth / 2);
    final frameTop = centerY - (frameHeight / 2);

    // Draw the dark overlay with a transparent rectangle for the frame
    final path = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
      ..addRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(frameLeft, frameTop, frameWidth, frameHeight),
          const Radius.circular(12),
        ),
      )
      ..fillType = PathFillType.evenOdd;

    canvas.drawPath(path, paint);

    // Draw frame border
    final borderPaint = Paint()
      ..color = const Color(0xFF2563EB).withOpacity(0.8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(frameLeft, frameTop, frameWidth, frameHeight),
        const Radius.circular(12),
      ),
      borderPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
