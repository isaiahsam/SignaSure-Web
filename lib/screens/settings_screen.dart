import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../providers/theme_provider.dart';
import '../providers/user_provider.dart';
import '../services/auth_service.dart';
import '../services/rate_limit_service.dart';
import '../providers/font_size_provider.dart';
import 'landing_screen.dart';
import 'legal_document_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  Future<Map<String, dynamic>> _getUsageInfo() async {
    final stats = await RateLimitService.getUsageStats();
    final rateLimitResult = await RateLimitService.canMakeRequest();
    return {
      'stats': stats,
      'rateLimitResult': rateLimitResult,
    };
  }

  String _formatTimeUntil(DateTime resetTime) {
    final now = DateTime.now();
    final difference = resetTime.difference(now);

    if (difference.isNegative) {
      return 'Now';
    }

    if (difference.inHours > 0) {
      final hours = difference.inHours;
      final minutes = difference.inMinutes.remainder(60);
      if (minutes > 0) {
        return '${hours}h ${minutes}m';
      }
      return '${hours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    } else {
      return '${difference.inSeconds}s';
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final userProvider = Provider.of<UserProvider>(context);
    final fontSizeProvider = Provider.of<FontSizeProvider>(context);
    final isDark = themeProvider.isDarkMode;
    final authService = AuthService();
    final userEmail = authService.currentUser?.email ?? 'No email';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),

                // Header
                Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(
                        Icons.arrow_back,
                        color: isDark ? Colors.white : Colors.black,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Settings',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        color: isDark ? Colors.white : Colors.black,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Legal Disclaimer Banner
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.amber[50],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.amber[700]!, width: 2),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.warning_amber_rounded,
                        color: Colors.amber[900],
                        size: 28,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Important Legal Notice',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.amber[900],
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'SignaSure is NOT a substitute for legal advice. Always consult a qualified attorney before signing any legal document.',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.amber[900],
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Profile Section
                _buildSection(
                  context,
                  title: 'Profile',
                  isDark: isDark,
                  children: [
                    _buildProfileTile(
                      context,
                      icon: Icons.person_outline,
                      label: 'Name',
                      value: userProvider.userName,
                      isDark: isDark,
                      onTap: null, // Cannot edit name - uses Google account first name
                    ),
                    const SizedBox(height: 12),
                    _buildProfileTile(
                      context,
                      icon: Icons.email_outlined,
                      label: 'Email',
                      value: userEmail,
                      isDark: isDark,
                      onTap: null, // Cannot edit email
                    ),
                    const SizedBox(height: 12),
                    _buildProfileTile(
                      context,
                      icon: Icons.phone_outlined,
                      label: 'Phone Number',
                      value: userProvider.phoneNumber.isEmpty
                          ? 'Not set'
                          : userProvider.phoneNumber,
                      isDark: isDark,
                      onTap: () => _showEditDialog(
                        context,
                        title: 'Edit Phone Number',
                        currentValue: userProvider.phoneNumber,
                        keyboardType: TextInputType.phone,
                        onSave: (value) => userProvider.updatePhoneNumber(value),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Appearance Section
                _buildSection(
                  context,
                  title: 'Appearance',
                  isDark: isDark,
                  children: [
                    _buildThemeTile(
                      context,
                      icon: Icons.light_mode_outlined,
                      label: 'Light Mode',
                      isSelected: themeProvider.themeMode == AppThemeMode.light,
                      isDark: isDark,
                      onTap: () {
                        themeProvider.setThemeMode(AppThemeMode.light);
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildThemeTile(
                      context,
                      icon: Icons.dark_mode_outlined,
                      label: 'Dark Mode',
                      isSelected: themeProvider.themeMode == AppThemeMode.dark,
                      isDark: isDark,
                      onTap: () {
                        themeProvider.setThemeMode(AppThemeMode.dark);
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildThemeTile(
                      context,
                      icon: Icons.brightness_auto,
                      label: 'System',
                      isSelected: themeProvider.themeMode == AppThemeMode.system,
                      isDark: isDark,
                      onTap: () {
                        themeProvider.setThemeMode(AppThemeMode.system);
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Font Size Section
                _buildSection(
                  context,
                  title: 'Font Size',
                  isDark: isDark,
                  children: [
                    _buildFontSizeSlider(
                      context,
                      fontSizeProvider: fontSizeProvider,
                      isDark: isDark,
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Usage Statistics Section
                _buildSection(
                  context,
                  title: 'AI Analysis Usage',
                  isDark: isDark,
                  children: [
                    FutureBuilder<Map<String, dynamic>>(
                      future: _getUsageInfo(),
                      builder: (context, snapshot) {
                        if (!snapshot.hasData) {
                          return const Padding(
                            padding: EdgeInsets.all(16),
                            child: Center(child: CircularProgressIndicator()),
                          );
                        }

                        final stats = snapshot.data!['stats'] as UsageStats;
                        final rateLimitResult = snapshot.data!['rateLimitResult'] as RateLimitResult;

                        return Column(
                          children: [
                            _buildUsageTile(
                              context,
                              icon: Icons.access_time,
                              label: 'This Hour',
                              used: stats.usedThisHour,
                              remaining: stats.remainingThisHour,
                              max: stats.maxPerHour,
                              isDark: isDark,
                              resetTime: rateLimitResult.hourlyResetTime,
                            ),
                            const SizedBox(height: 12),
                            _buildUsageTile(
                              context,
                              icon: Icons.today,
                              label: 'Today',
                              used: stats.usedToday,
                              remaining: stats.remainingToday,
                              max: stats.maxPerDay,
                              isDark: isDark,
                              resetTime: rateLimitResult.dailyResetTime,
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // About Section
                _buildSection(
                  context,
                  title: 'About',
                  isDark: isDark,
                  children: [
                    _buildInfoTile(
                      context,
                      icon: Icons.info_outline,
                      label: 'Version',
                      value: '1.0.0',
                      isDark: isDark,
                    ),
                    const SizedBox(height: 12),
                    _buildInfoTile(
                      context,
                      icon: Icons.description_outlined,
                      label: 'Terms of Service',
                      isDark: isDark,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const LegalDocumentScreen(
                              title: 'Terms of Service',
                              assetPath: 'assets/legal/terms_of_service.md',
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildInfoTile(
                      context,
                      icon: Icons.privacy_tip_outlined,
                      label: 'Privacy Policy',
                      isDark: isDark,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const LegalDocumentScreen(
                              title: 'Privacy Policy',
                              assetPath: 'assets/legal/privacy_policy.md',
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Sign Out Button
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton.icon(
                    onPressed: () => _handleSignOut(context),
                    icon: const Icon(Icons.logout),
                    label: const Text(
                      'Sign Out',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required bool isDark,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
              letterSpacing: 0.5,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF252525) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(isDark ? 0.3 : 0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildProfileTile(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    required bool isDark,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: const Color(0xFF2563EB),
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                  ),
                ],
              ),
            ),
            if (onTap != null)
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: isDark ? Colors.grey[600] : Colors.grey[400],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeTile(
    BuildContext context, {
    required IconData icon,
    required String label,
    required bool isSelected,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF2563EB).withOpacity(0.15)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF2563EB)
                : (isDark ? Colors.grey[800]! : Colors.grey[300]!),
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? const Color(0xFF2563EB)
                  : (isDark ? Colors.grey[400] : Colors.grey[600]),
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: isSelected
                      ? const Color(0xFF2563EB)
                      : (isDark ? Colors.white : Colors.black),
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: Color(0xFF2563EB),
                size: 24,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFontSizeSlider(
    BuildContext context, {
    required FontSizeProvider fontSizeProvider,
    required bool isDark,
  }) {
    // Map FontSize enum to slider value (0-3)
    double sliderValue = fontSizeProvider.fontSize.index.toDouble();

    // Calculate percentage for display
    int percentage = (fontSizeProvider.scaleFactor * 100).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(
                  Icons.text_fields,
                  color: const Color(0xFF2563EB),
                  size: 24,
                ),
                const SizedBox(width: 12),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  transitionBuilder: (Widget child, Animation<double> animation) {
                    return FadeTransition(
                      opacity: animation,
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0.0, 0.3),
                          end: Offset.zero,
                        ).animate(CurvedAnimation(
                          parent: animation,
                          curve: Curves.easeInOut,
                        )),
                        child: child,
                      ),
                    );
                  },
                  child: Text(
                    fontSizeProvider.fontSizeLabel,
                    key: ValueKey<String>(fontSizeProvider.fontSizeLabel),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                  ),
                ),
              ],
            ),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              transitionBuilder: (Widget child, Animation<double> animation) {
                return ScaleTransition(
                  scale: CurvedAnimation(
                    parent: animation,
                    curve: Curves.easeInOut,
                  ),
                  child: FadeTransition(
                    opacity: animation,
                    child: child,
                  ),
                );
              },
              child: Container(
                key: ValueKey<int>(percentage),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$percentage%',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF2563EB),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SliderTheme(
          data: SliderThemeData(
            activeTrackColor: const Color(0xFF2563EB),
            inactiveTrackColor: isDark ? Colors.grey[700] : Colors.grey[300],
            thumbColor: const Color(0xFF2563EB),
            overlayColor: const Color(0xFF2563EB).withOpacity(0.2),
            trackHeight: 6,
            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
          ),
          child: Slider(
            value: sliderValue,
            min: 0,
            max: 3,
            divisions: 3,
            onChanged: (value) {
              // Map slider value back to FontSize enum
              FontSize newSize;
              switch (value.round()) {
                case 0:
                  newSize = FontSize.small;
                  break;
                case 1:
                  newSize = FontSize.medium;
                  break;
                case 2:
                  newSize = FontSize.large;
                  break;
                case 3:
                  newSize = FontSize.extraLarge;
                  break;
                default:
                  newSize = FontSize.medium;
              }
              fontSizeProvider.setFontSize(newSize);
            },
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Small',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[500] : Colors.grey[600],
              ),
            ),
            Text(
              'Medium',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[500] : Colors.grey[600],
              ),
            ),
            Text(
              'Large',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[500] : Colors.grey[600],
              ),
            ),
            Text(
              'Extra Large',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[500] : Colors.grey[600],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoTile(
    BuildContext context, {
    required IconData icon,
    required String label,
    String? value,
    required bool isDark,
    VoidCallback? onTap,
    Widget? trailing,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Icon(
              icon,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black,
                ),
              ),
            ),
            if (value != null)
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Text(
                  value,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                ),
              ),
            if (trailing != null)
              trailing
            else if (onTap != null && value == null)
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: isDark ? Colors.grey[600] : Colors.grey[400],
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleSignOut(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sign Out', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final authService = AuthService();
        final userProvider = Provider.of<UserProvider>(context, listen: false);
        final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
        final fontSizeProvider = Provider.of<FontSizeProvider>(context, listen: false);

        // Clear user data from providers
        userProvider.clearUserData();
        themeProvider.clearTheme();
        fontSizeProvider.clearFontSize();

        // Sign out from Firebase
        await authService.signOut();

        if (context.mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const LandingScreen()),
            (route) => false,
          );
        }

        Fluttertoast.showToast(
          msg: "Signed out successfully",
          toastLength: Toast.LENGTH_SHORT,
        );
      } catch (e) {
        Fluttertoast.showToast(
          msg: "Error signing out: $e",
          toastLength: Toast.LENGTH_LONG,
        );
      }
    }
  }

  Future<void> _showEditDialog(
    BuildContext context, {
    required String title,
    required String currentValue,
    required Function(String) onSave,
    TextInputType? keyboardType,
  }) async {
    final controller = TextEditingController(text: currentValue);
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final isDark = themeProvider.isDarkMode;

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF252525) : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        content: TextField(
          controller: controller,
          keyboardType: keyboardType,
          autofocus: true,
          style: TextStyle(
            color: isDark ? Colors.white : Colors.black,
            fontWeight: FontWeight.w600,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE5E5E5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              onSave(controller.text);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Save',
              style: TextStyle(
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsageTile(
    BuildContext context, {
    required IconData icon,
    required String label,
    required int used,
    required int remaining,
    required int max,
    required bool isDark,
    DateTime? resetTime,
  }) {
    final percentage = max > 0 ? used / max : 0.0;

    // Dynamic color based on remaining: green (2+), orange (1), red (0)
    final Color color = remaining >= 2
        ? Colors.green
        : remaining == 1
            ? Colors.orange
            : Colors.red;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2A2A2A) : Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black,
                ),
              ),
              const Spacer(),
              Text(
                '$used / $max',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: percentage,
            backgroundColor: isDark ? Colors.grey[700] : Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$remaining remaining',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
              if (resetTime != null)
                Row(
                  children: [
                    Icon(
                      Icons.refresh,
                      size: 12,
                      color: isDark ? Colors.grey[500] : Colors.grey[500],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Resets in ${_formatTimeUntil(resetTime)}',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.grey[500] : Colors.grey[500],
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}
