import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiKeyProvider with ChangeNotifier {
  String _geminiApiKey = '';
  bool _isConfigured = false;

  String get geminiApiKey => _geminiApiKey;
  bool get isConfigured => _isConfigured && _geminiApiKey.isNotEmpty;

  ApiKeyProvider() {
    _loadApiKeys();
  }

  Future<void> _loadApiKeys() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _geminiApiKey = prefs.getString('gemini_api_key') ?? '';
      _isConfigured = _geminiApiKey.isNotEmpty;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading API keys: $e');
    }
  }

  Future<bool> setGeminiApiKey(String apiKey) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('gemini_api_key', apiKey);
      _geminiApiKey = apiKey;
      _isConfigured = apiKey.isNotEmpty;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error saving API key: $e');
      return false;
    }
  }

  Future<bool> clearGeminiApiKey() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('gemini_api_key');
      _geminiApiKey = '';
      _isConfigured = false;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error clearing API key: $e');
      return false;
    }
  }

  /// Validates the API key format (basic check)
  bool validateApiKeyFormat(String apiKey) {
    // Gemini API keys typically start with "AIza" and are 39 characters long
    return apiKey.isNotEmpty &&
           apiKey.startsWith('AIza') &&
           apiKey.length == 39;
  }
}
