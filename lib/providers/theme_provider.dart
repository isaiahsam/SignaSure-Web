import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppThemeMode { light, dark, system }

class ThemeProvider extends ChangeNotifier {
  AppThemeMode _themeMode = AppThemeMode.system;
  String? _currentUserId;

  AppThemeMode get themeMode => _themeMode;

  bool get isDarkMode {
    if (_themeMode == AppThemeMode.system) {
      // Get system theme
      final brightness = WidgetsBinding.instance.platformDispatcher.platformBrightness;
      return brightness == Brightness.dark;
    }
    return _themeMode == AppThemeMode.dark;
  }

  ThemeProvider();

  /// Load theme for specific user
  Future<void> loadTheme(String userId) async {
    _currentUserId = userId;
    final prefs = await SharedPreferences.getInstance();
    final themeModeString = prefs.getString('themeMode_$userId') ?? 'system';

    switch (themeModeString) {
      case 'light':
        _themeMode = AppThemeMode.light;
        break;
      case 'dark':
        _themeMode = AppThemeMode.dark;
        break;
      default:
        _themeMode = AppThemeMode.system;
    }
    notifyListeners();
  }

  /// Set theme mode
  Future<void> setThemeMode(AppThemeMode mode) async {
    if (_currentUserId == null) return;

    _themeMode = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('themeMode_$_currentUserId', mode.toString().split('.').last);
    notifyListeners();
  }

  /// Toggle between light and dark (for backwards compatibility)
  Future<void> toggleTheme() async {
    await setThemeMode(_themeMode == AppThemeMode.dark ? AppThemeMode.light : AppThemeMode.dark);
  }

  /// Clear theme data
  void clearTheme() {
    _themeMode = AppThemeMode.system;
    _currentUserId = null;
    notifyListeners();
  }

  ThemeData get lightTheme => ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: const Color(0xFF2563EB),
        scaffoldBackgroundColor: const Color(0xFFE5E5E5), // Darker gray
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB),
          brightness: Brightness.light,
          background: const Color(0xFFE5E5E5),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.black,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2563EB),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 4,
            shadowColor: const Color(0xFF2563EB).withOpacity(0.4),
          ),
        ),
        cardTheme: CardTheme(
          elevation: 2,
          color: Colors.white,
          shadowColor: Colors.black.withOpacity(0.1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
        ),
        useMaterial3: true,
      );

  ThemeData get darkTheme => ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: const Color(0xFF3B82F6),
        scaffoldBackgroundColor: const Color(0xFF1A1A1A),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3B82F6),
          brightness: Brightness.dark,
          background: const Color(0xFF1A1A1A),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF3B82F6),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 4,
            shadowColor: const Color(0xFF3B82F6).withOpacity(0.4),
          ),
        ),
        cardTheme: CardTheme(
          elevation: 2,
          color: const Color(0xFF252525),
          shadowColor: Colors.black.withOpacity(0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
        ),
        useMaterial3: true,
      );
}
