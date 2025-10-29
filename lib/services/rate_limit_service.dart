import 'package:shared_preferences/shared_preferences.dart';
import 'auth_service.dart';

class RateLimitService {
  static const int maxPerHour = 5;
  static const int maxPerDay = 20;

  /// Get usage key for current user
  static String _getUsageKey() {
    final userId = AuthService().currentUser?.uid ?? 'anonymous';
    return 'api_usage_timestamps_$userId';
  }

  /// Check if user can make another API call
  static Future<RateLimitResult> canMakeRequest() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();
    final usageKey = _getUsageKey();

    // Get stored timestamps for current user
    final storedTimestamps = prefs.getStringList(usageKey) ?? [];
    final timestamps = storedTimestamps
        .map((ts) => DateTime.parse(ts))
        .where((dt) => now.difference(dt).inHours < 24) // Keep only last 24 hours
        .toList();

    // Count requests in last hour
    final lastHour = timestamps.where((dt) => now.difference(dt).inHours < 1).length;

    // Count requests in last day
    final lastDay = timestamps.length;

    // Check hourly limit
    if (lastHour >= maxPerHour) {
      final oldestInHour = timestamps
          .where((dt) => now.difference(dt).inHours < 1)
          .reduce((a, b) => a.isBefore(b) ? a : b);
      final resetTime = oldestInHour.add(const Duration(hours: 1));

      return RateLimitResult(
        canProceed: false,
        remaining: 0,
        resetTime: resetTime,
        limitType: 'hourly',
        message: 'Hourly limit reached ($maxPerHour per hour). Next analysis available in ${_formatDuration(resetTime.difference(now))}.',
      );
    }

    // Check daily limit
    if (lastDay >= maxPerDay) {
      final oldestInDay = timestamps.reduce((a, b) => a.isBefore(b) ? a : b);
      final resetTime = oldestInDay.add(const Duration(hours: 24));

      return RateLimitResult(
        canProceed: false,
        remaining: 0,
        resetTime: resetTime,
        limitType: 'daily',
        message: 'Daily limit reached ($maxPerDay per day). Next analysis available in ${_formatDuration(resetTime.difference(now))}.',
      );
    }

    // Calculate remaining and reset times
    final remainingHourly = maxPerHour - lastHour;
    final remainingDaily = maxPerDay - lastDay;

    // Calculate next reset time for hourly
    DateTime hourlyResetTime = now.add(const Duration(hours: 1));
    if (timestamps.where((dt) => now.difference(dt).inHours < 1).isNotEmpty) {
      final oldestInHour = timestamps
          .where((dt) => now.difference(dt).inHours < 1)
          .reduce((a, b) => a.isBefore(b) ? a : b);
      hourlyResetTime = oldestInHour.add(const Duration(hours: 1));
    }

    // Calculate next reset time for daily
    DateTime dailyResetTime = now.add(const Duration(hours: 24));
    if (timestamps.isNotEmpty) {
      final oldestInDay = timestamps.reduce((a, b) => a.isBefore(b) ? a : b);
      dailyResetTime = oldestInDay.add(const Duration(hours: 24));
    }

    return RateLimitResult(
      canProceed: true,
      remaining: remainingHourly < remainingDaily ? remainingHourly : remainingDaily,
      resetTime: hourlyResetTime,
      limitType: 'available',
      message: 'You have $remainingHourly analyses left this hour, $remainingDaily left today.',
      hourlyResetTime: hourlyResetTime,
      dailyResetTime: dailyResetTime,
    );
  }

  /// Record a successful API call
  static Future<void> recordUsage() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();
    final usageKey = _getUsageKey();

    final storedTimestamps = prefs.getStringList(usageKey) ?? [];
    final timestamps = storedTimestamps
        .map((ts) => DateTime.parse(ts))
        .where((dt) => now.difference(dt).inHours < 24)
        .toList();

    timestamps.add(now);

    await prefs.setStringList(
      usageKey,
      timestamps.map((dt) => dt.toIso8601String()).toList(),
    );
  }

  /// Get current usage stats
  static Future<UsageStats> getUsageStats() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();
    final usageKey = _getUsageKey();

    final storedTimestamps = prefs.getStringList(usageKey) ?? [];
    final timestamps = storedTimestamps
        .map((ts) => DateTime.parse(ts))
        .where((dt) => now.difference(dt).inHours < 24)
        .toList();

    final usedLastHour = timestamps.where((dt) => now.difference(dt).inHours < 1).length;
    final usedLastDay = timestamps.length;

    return UsageStats(
      usedThisHour: usedLastHour,
      usedToday: usedLastDay,
      remainingThisHour: maxPerHour - usedLastHour,
      remainingToday: maxPerDay - usedLastDay,
      maxPerHour: maxPerHour,
      maxPerDay: maxPerDay,
    );
  }

  /// Clear all usage data (for testing/admin)
  static Future<void> resetUsage() async {
    final prefs = await SharedPreferences.getInstance();
    final usageKey = _getUsageKey();
    await prefs.remove(usageKey);
  }

  static String _formatDuration(Duration duration) {
    if (duration.inHours > 0) {
      final hours = duration.inHours;
      final minutes = duration.inMinutes.remainder(60);
      return '${hours}h ${minutes}m';
    } else {
      return '${duration.inMinutes}m';
    }
  }
}

class RateLimitResult {
  final bool canProceed;
  final int remaining;
  final DateTime resetTime;
  final String limitType; // 'hourly', 'daily', 'available', or 'none'
  final String message;
  final DateTime? hourlyResetTime;
  final DateTime? dailyResetTime;

  RateLimitResult({
    required this.canProceed,
    required this.remaining,
    required this.resetTime,
    required this.limitType,
    required this.message,
    this.hourlyResetTime,
    this.dailyResetTime,
  });
}

class UsageStats {
  final int usedThisHour;
  final int usedToday;
  final int remainingThisHour;
  final int remainingToday;
  final int maxPerHour;
  final int maxPerDay;

  UsageStats({
    required this.usedThisHour,
    required this.usedToday,
    required this.remainingThisHour,
    required this.remainingToday,
    required this.maxPerHour,
    required this.maxPerDay,
  });
}
