import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  static const String _onboardingCompletedKey = 'onboarding_completed';

  /// Check if user has completed onboarding (per user)
  static Future<bool> hasCompletedOnboarding({String? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    if (userId != null) {
      // Check per-user onboarding status
      return prefs.getBool('onboarding_completed_$userId') ?? false;
    }
    // Fallback to global onboarding status
    return prefs.getBool(_onboardingCompletedKey) ?? false;
  }

  /// Set onboarding completion status (per user)
  static Future<bool> setOnboardingCompleted(bool completed, {String? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    if (userId != null) {
      // Set per-user onboarding status
      await prefs.setBool('onboarding_completed_$userId', completed);
    }
    // Also set global for backward compatibility
    return prefs.setBool(_onboardingCompletedKey, completed);
  }

  /// Check if user has set a username
  static Future<bool> hasUsername(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final username = prefs.getString('userName_$userId');
    return username != null && username.isNotEmpty && username != 'User';
  }

  /// Clear all preferences (useful for testing or reset)
  static Future<bool> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.clear();
  }

  /// Reset onboarding status (useful for testing)
  static Future<bool> resetOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.remove(_onboardingCompletedKey);
  }
}
