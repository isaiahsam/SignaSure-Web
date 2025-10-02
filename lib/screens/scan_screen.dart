import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:path_provider/path_provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../services/ocr_service.dart';
import '../services/ai_analysis_service.dart';
import '../services/database_service.dart';
import '../models/document.dart';
import 'analysis_result_screen.dart';

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
  final ImagePicker _imagePicker = ImagePicker();

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
      setState(() {
        _isProcessing = true;
      });

      final XFile photo = await _cameraController!.takePicture();
      await _processImage(File(photo.path));
    } catch (e) {
      print('Error capturing photo: $e');
      Fluttertoast.showToast(
        msg: "Error capturing photo: $e",
        toastLength: Toast.LENGTH_SHORT,
      );
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  Future<void> _pickFromGallery() async {
    try {
      setState(() {
        _isProcessing = true;
      });

      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 100,
      );

      if (image != null) {
        await _processImage(File(image.path));
      }
    } catch (e) {
      print('Error picking image from gallery: $e');
      Fluttertoast.showToast(
        msg: "Error picking image: $e",
        toastLength: Toast.LENGTH_SHORT,
      );
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  Future<void> _processImage(File imageFile) async {
    try {
      // Extract text from image using OCR
      final extractedText = await OCRService.extractTextFromImage(imageFile.path);

      if (extractedText == null || extractedText.trim().isEmpty) {
        Fluttertoast.showToast(
          msg: "No text found in the image. Please try again with a clearer image.",
          toastLength: Toast.LENGTH_LONG,
        );
        return;
      }

      // Save image to app directory
      final directory = await getApplicationDocumentsDirectory();
      final fileName = 'document_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final savedFile = File('${directory.path}/$fileName');
      await imageFile.copy(savedFile.path);

      // Create document record
      final document = Document(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        filePath: savedFile.path,
        fileName: fileName,
        scanDate: DateTime.now(),
        type: DocumentType.other,
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

      Fluttertoast.showToast(
        msg: "Document scanned and analyzed successfully!",
        toastLength: Toast.LENGTH_SHORT,
      );
    } catch (e) {
      print('Error processing image: $e');
      Fluttertoast.showToast(
        msg: "Error processing document: $e",
        toastLength: Toast.LENGTH_LONG,
      );
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Document'),
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
          : Column(
              children: [
                Expanded(
                  child: _isCameraInitialized
                      ? Stack(
                          children: [
                            CameraPreview(_cameraController!),
                            Positioned(
                              top: 20,
                              left: 20,
                              right: 20,
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.black54,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'Position the document within the frame and tap capture',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                            // Overlay frame for document positioning
                            Center(
                              child: Container(
                                width: MediaQuery.of(context).size.width * 0.8,
                                height: MediaQuery.of(context).size.height * 0.4,
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 2,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ],
                        )
                      : const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.camera_alt,
                                size: 100,
                                color: Colors.grey,
                              ),
                              SizedBox(height: 20),
                              Text(
                                'Initializing camera...',
                                style: TextStyle(fontSize: 18),
                              ),
                            ],
                          ),
                        ),
                ),
                Container(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      FloatingActionButton(
                        onPressed: _pickFromGallery,
                        backgroundColor: Colors.grey[700],
                        child: const Icon(Icons.photo_library),
                      ),
                      FloatingActionButton.extended(
                        onPressed: _isCameraInitialized ? _capturePhoto : null,
                        backgroundColor: Theme.of(context).primaryColor,
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('Capture'),
                      ),
                      FloatingActionButton(
                        onPressed: () {
                          // Switch camera (front/back)
                          if (_cameras != null && _cameras!.length > 1) {
                            // Implement camera switching logic
                          }
                        },
                        backgroundColor: Colors.grey[700],
                        child: const Icon(Icons.flip_camera_ios),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}