import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum FontSize { small, medium, large, extraLarge }

class FontSizeProvider extends ChangeNotifier {
  FontSize _fontSize = FontSize.medium;
  String? _currentUserId;

  FontSize get fontSize => _fontSize;

  double get scaleFactor {
    switch (_fontSize) {
      case FontSize.small:
        return 0.85;
      case FontSize.medium:
        return 1.0;
      case FontSize.large:
        return 1.15;
      case FontSize.extraLarge:
        return 1.3;
    }
  }

  String get fontSizeLabel {
    switch (_fontSize) {
      case FontSize.small:
        return 'Small';
      case FontSize.medium:
        return 'Medium';
      case FontSize.large:
        return 'Large';
      case FontSize.extraLarge:
        return 'Extra Large';
    }
  }

  FontSizeProvider();

  /// Load font size for specific user
  Future<void> loadFontSize(String userId) async {
    _currentUserId = userId;
    final prefs = await SharedPreferences.getInstance();
    final fontSizeString = prefs.getString('fontSize_$userId') ?? 'medium';

    switch (fontSizeString) {
      case 'small':
        _fontSize = FontSize.small;
        break;
      case 'large':
        _fontSize = FontSize.large;
        break;
      case 'extraLarge':
        _fontSize = FontSize.extraLarge;
        break;
      default:
        _fontSize = FontSize.medium;
    }
    notifyListeners();
  }

  /// Set font size
  Future<void> setFontSize(FontSize size) async {
    if (_currentUserId == null) return;

    _fontSize = size;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fontSize_$_currentUserId', size.toString().split('.').last);
    notifyListeners();
  }

  /// Clear font size data
  void clearFontSize() {
    _fontSize = FontSize.medium;
    _currentUserId = null;
    notifyListeners();
  }
}
