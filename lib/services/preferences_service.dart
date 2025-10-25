import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  static const String _onboardingCompletedKey = 'onboarding_completed';

  /// Check if user has completed onboarding
  static Future<bool> hasCompletedOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_onboardingCompletedKey) ?? false;
  }

  /// Set onboarding completion status
  static Future<bool> setOnboardingCompleted(bool completed) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.setBool(_onboardingCompletedKey, completed);
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
