import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';
import '../providers/theme_provider.dart';
import 'main_screen.dart';

class DemographicSurveyScreen extends StatefulWidget {
  const DemographicSurveyScreen({super.key});

  @override
  State<DemographicSurveyScreen> createState() => _DemographicSurveyScreenState();
}

class _DemographicSurveyScreenState extends State<DemographicSurveyScreen> {
  String? _selectedUsage;

  final List<UsageOption> _usageOptions = [
    UsageOption(
      value: 'work',
      title: 'Work',
      description: 'Employment contracts, NDAs, and business agreements',
      icon: Icons.work_outline,
    ),
    UsageOption(
      value: 'school',
      title: 'School',
      description: 'Student contracts, enrollment forms, and academic agreements',
      icon: Icons.school_outlined,
    ),
    UsageOption(
      value: 'personal',
      title: 'Personal',
      description: 'Leases, loans, insurance, and personal contracts',
      icon: Icons.person_outline,
    ),
    UsageOption(
      value: 'business',
      title: 'Business',
      description: 'Vendor agreements, client contracts, and partnerships',
      icon: Icons.business_outlined,
    ),
  ];

  Future<void> _saveSurvey() async {
    if (_selectedUsage == null) return;

    final userProvider = Provider.of<UserProvider>(context, listen: false);
    await userProvider.updateUsageType(_selectedUsage!);

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const MainScreen()),
      );
    }
  }

  void _skipSurvey() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const MainScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF1A1A1A) : Colors.white,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.08),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),

              // Skip button
              Align(
                alignment: Alignment.topRight,
                child: TextButton(
                  onPressed: _skipSurvey,
                  child: Text(
                    'Skip',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Title
              Text(
                'One more thing...',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: isDark ? const Color(0xFF3B82F6) : const Color(0xFF2563EB),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'What will you be using SignaSure for?',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.grey[400] : Colors.grey[700],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'This helps us provide better recommendations',
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.grey[500] : Colors.grey[600],
                ),
              ),

              const SizedBox(height: 40),

              // Usage options
              Expanded(
                child: ListView.builder(
                  itemCount: _usageOptions.length,
                  itemBuilder: (context, index) {
                    final option = _usageOptions[index];
                    final isSelected = _selectedUsage == option.value;

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedUsage = option.value;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (isDark ? const Color(0xFF2563EB).withOpacity(0.15) : const Color(0xFF2563EB).withOpacity(0.1))
                              : (isDark ? const Color(0xFF252525) : const Color(0xFFF5F5F5)),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF2563EB)
                                : (isDark ? Colors.grey[800]! : Colors.grey[300]!),
                            width: 2,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? const Color(0xFF2563EB).withOpacity(0.2)
                                    : (isDark ? const Color(0xFF1A1A1A) : Colors.white),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                option.icon,
                                size: 28,
                                color: isSelected
                                    ? const Color(0xFF2563EB)
                                    : (isDark ? Colors.grey[400] : Colors.grey[600]),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    option.title,
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w700,
                                      color: isSelected
                                          ? const Color(0xFF2563EB)
                                          : (isDark ? Colors.white : Colors.black),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    option.description,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                                    ),
                                  ),
                                ],
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
                  },
                ),
              ),

              const SizedBox(height: 24),

              // Continue button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _selectedUsage != null ? _saveSurvey : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 3,
                    disabledBackgroundColor: Colors.grey[400],
                  ),
                  child: const Text(
                    'Continue',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class UsageOption {
  final String value;
  final String title;
  final String description;
  final IconData icon;

  UsageOption({
    required this.value,
    required this.title,
    required this.description,
    required this.icon,
  });
}
