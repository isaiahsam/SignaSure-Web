import 'dart:io';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:image/image.dart' as img;

class OCRService {
  static final _textRecognizer = TextRecognizer();

  static Future<String?> extractTextFromImage(String imagePath) async {
    try {
      final inputImage = InputImage.fromFilePath(imagePath);
      final RecognizedText recognizedText = await _textRecognizer.processImage(inputImage);

      if (recognizedText.text.isNotEmpty) {
        return recognizedText.text;
      }
      return null;
    } catch (e) {
      print('Error extracting text from image: $e');
      return null;
    }
  }

  static Future<String?> extractTextFromFile(File file) async {
    try {
      // For image files, use OCR
      if (_isImageFile(file.path)) {
        return await extractTextFromImage(file.path);
      }

      // For text files, read directly
      if (_isTextFile(file.path)) {
        return await file.readAsString();
      }

      // For other file types, try OCR after conversion
      return await extractTextFromImage(file.path);
    } catch (e) {
      print('Error extracting text from file: $e');
      return null;
    }
  }

  static bool _isImageFile(String filePath) {
    final extension = filePath.toLowerCase().split('.').last;
    return ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp'].contains(extension);
  }

  static bool _isTextFile(String filePath) {
    final extension = filePath.toLowerCase().split('.').last;
    return ['txt', 'doc', 'docx'].contains(extension);
  }

  static Future<File?> preprocessImage(File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      img.Image? image = img.decodeImage(bytes);

      if (image == null) return null;

      // Convert to grayscale for better OCR
      image = img.grayscale(image);

      // Increase contrast
      image = img.contrast(image, contrast: 1.2);

      // Sharpen the image
      image = img.convolution(image, filter: [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ]);

      // Save processed image
      final processedBytes = img.encodePng(image);
      final processedFile = File('${imageFile.path}_processed.png');
      await processedFile.writeAsBytes(processedBytes);

      return processedFile;
    } catch (e) {
      print('Error preprocessing image: $e');
      return null;
    }
  }

  static void dispose() {
    _textRecognizer.close();
  }

  static Future<List<TextBlock>> getTextBlocks(String imagePath) async {
    try {
      final inputImage = InputImage.fromFilePath(imagePath);
      final RecognizedText recognizedText = await _textRecognizer.processImage(inputImage);
      return recognizedText.blocks;
    } catch (e) {
      print('Error getting text blocks: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>> extractStructuredText(String imagePath) async {
    try {
      final blocks = await getTextBlocks(imagePath);

      Map<String, dynamic> structuredData = {
        'fullText': '',
        'paragraphs': <String>[],
        'lines': <String>[],
        'confidence': 0.0,
      };

      int blockCount = 0;

      for (final block in blocks) {
        structuredData['fullText'] += '${block.text}\n';
        structuredData['paragraphs'].add(block.text);

        for (final line in block.lines) {
          structuredData['lines'].add(line.text);
        }

        // Note: confidence might not be available in all ML Kit versions
        blockCount++;
      }

      if (blockCount > 0) {
        structuredData['confidence'] = 0.95; // Default confidence value
      }

      return structuredData;
    } catch (e) {
      print('Error extracting structured text: $e');
      return {
        'fullText': '',
        'paragraphs': <String>[],
        'lines': <String>[],
        'confidence': 0.0,
      };
    }
  }
}