import 'package:shared_preferences/shared_preferences.dart';

class RateLimitService {
  static const String _usageKey = 'api_usage_timestamps';
  static const int maxPerHour = 3;
  static const int maxPerDay = 10;

  /// Check if user can make another API call
  static Future<RateLimitResult> canMakeRequest() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();

    // Get stored timestamps
    final storedTimestamps = prefs.getStringList(_usageKey) ?? [];
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
        message: 'Hourly limit reached (3 per hour). Next analysis available in ${_formatDuration(resetTime.difference(now))}.',
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
        message: 'Daily limit reached (10 per day). Next analysis available in ${_formatDuration(resetTime.difference(now))}.',
      );
    }

    // Calculate remaining
    final remainingHourly = maxPerHour - lastHour;
    final remainingDaily = maxPerDay - lastDay;

    return RateLimitResult(
      canProceed: true,
      remaining: remainingHourly < remainingDaily ? remainingHourly : remainingDaily,
      resetTime: now.add(const Duration(hours: 1)),
      limitType: 'none',
      message: 'You have $remainingHourly analyses left this hour, $remainingDaily left today.',
    );
  }

  /// Record a successful API call
  static Future<void> recordUsage() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();

    final storedTimestamps = prefs.getStringList(_usageKey) ?? [];
    final timestamps = storedTimestamps
        .map((ts) => DateTime.parse(ts))
        .where((dt) => now.difference(dt).inHours < 24)
        .toList();

    timestamps.add(now);

    await prefs.setStringList(
      _usageKey,
      timestamps.map((dt) => dt.toIso8601String()).toList(),
    );
  }

  /// Get current usage stats
  static Future<UsageStats> getUsageStats() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();

    final storedTimestamps = prefs.getStringList(_usageKey) ?? [];
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
    await prefs.remove(_usageKey);
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
  final String limitType; // 'hourly', 'daily', or 'none'
  final String message;

  RateLimitResult({
    required this.canProceed,
    required this.remaining,
    required this.resetTime,
    required this.limitType,
    required this.message,
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
