import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../providers/user_provider.dart';
import '../services/preferences_service.dart';
import '../services/auth_service.dart';
import 'demographic_survey_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  late AnimationController _fadeController;
  late AnimationController _scaleController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<Offset> _slideAnimation;

  final List<OnboardingPage> _pages = [
    OnboardingPage(
      title: 'Welcome to SignaSure',
      description:
          'Your AI-powered document guardian that helps you identify loopholes and unfavorable terms before signing',
      icon: Icons.verified_user,
      gradient: const [Color(0xFF2563EB), Color(0xFF3B82F6)],
      lottieAsset: null,
    ),
    OnboardingPage(
      title: 'AI-Powered Analysis',
      description:
          'Powered by Google Gemini AI to detect hidden fees, penalty clauses, and automatic renewals in seconds',
      icon: Icons.psychology,
      gradient: const [Color(0xFF7C3AED), Color(0xFF9333EA)],
      lottieAsset: null,
    ),
    OnboardingPage(
      title: 'Smart Document Scanning',
      description:
          'Scan multi-page documents with your camera or upload PDFs, images, and text files for instant analysis',
      icon: Icons.document_scanner,
      gradient: const [Color(0xFF059669), Color(0xFF10B981)],
      lottieAsset: null,
    ),
    OnboardingPage(
      title: 'Stay Protected',
      description:
          'Get risk scores, plain-English explanations, and actionable recommendations to make informed decisions',
      icon: Icons.shield_outlined,
      gradient: const [Color(0xFFDC2626), Color(0xFFEF4444)],
      lottieAsset: null,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _startAnimations();
  }

  void _setupAnimations() {
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeOut),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.elasticOut),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _slideController, curve: Curves.easeOutCubic),
    );
  }

  void _startAnimations() {
    _fadeController.forward();
    _scaleController.forward();
    _slideController.forward();
  }

  void _resetAnimations() {
    _fadeController.reset();
    _scaleController.reset();
    _slideController.reset();
    _startAnimations();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _fadeController.dispose();
    _scaleController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  Future<void> _completeOnboarding() async {
    final userId = AuthService().currentUser?.uid;
    final user = AuthService().currentUser;

    await PreferencesService.setOnboardingCompleted(true, userId: userId);

    if (mounted) {
      // Set username from Google account
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      if (user != null && user.displayName != null) {
        final firstName = user.displayName!.split(' ').first;
        await userProvider.updateUserName(firstName);
      }

      // Navigate to demographic survey screen
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const DemographicSurveyScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
          transitionDuration: const Duration(milliseconds: 800),
        ),
      );
    }
  }

  Future<void> _skipOnboarding() async {
    final userId = AuthService().currentUser?.uid;
    final user = AuthService().currentUser;

    await PreferencesService.setOnboardingCompleted(true, userId: userId);

    if (mounted) {
      // Set username from Google account
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      if (user != null && user.displayName != null) {
        final firstName = user.displayName!.split(' ').first;
        await userProvider.updateUserName(firstName);
      }

      // Navigate to demographic survey screen
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const DemographicSurveyScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
          transitionDuration: const Duration(milliseconds: 800),
        ),
      );
    }
  }

  void _onPageChanged(int page) {
    setState(() {
      _currentPage = page;
    });
    _resetAnimations();
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      _completeOnboarding();
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0A0A) : Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Page view
            PageView.builder(
              controller: _pageController,
              onPageChanged: _onPageChanged,
              itemCount: _pages.length,
              itemBuilder: (context, index) {
                return _buildPage(_pages[index], isDark);
              },
            ),

            // Skip button
            Positioned(
              top: 16,
              right: 16,
              child: TextButton(
                onPressed: _skipOnboarding,
                style: TextButton.styleFrom(
                  foregroundColor: isDark ? Colors.grey[400] : Colors.grey[600],
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                ),
                child: const Text(
                  'Skip',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),

            // Bottom controls
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  children: [
                    // Page indicators
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _pages.length,
                        (index) => _buildPageIndicator(index, isDark),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Next/Get Started button
                    _buildNextButton(isDark),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPage(OnboardingPage page, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(flex: 2),

          // Animated icon
          FadeTransition(
            opacity: _fadeAnimation,
            child: ScaleTransition(
              scale: _scaleAnimation,
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: page.gradient,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: page.gradient[0].withOpacity(0.4),
                      blurRadius: 40,
                      offset: const Offset(0, 20),
                    ),
                  ],
                ),
                child: Icon(
                  page.icon,
                  size: 80,
                  color: Colors.white,
                ),
              ),
            ),
          ),

          const SizedBox(height: 48),

          // Title
          SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Text(
                page.title,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white : Colors.black,
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Description
          SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Text(
                page.description,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),

          const Spacer(flex: 3),
        ],
      ),
    );
  }

  Widget _buildPageIndicator(int index, bool isDark) {
    final isActive = index == _currentPage;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      width: isActive ? 32 : 8,
      height: 8,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4),
        color: isActive
            ? _pages[_currentPage].gradient[0]
            : (isDark ? Colors.grey[700] : Colors.grey[300]),
      ),
    );
  }

  Widget _buildNextButton(bool isDark) {
    final isLastPage = _currentPage == _pages.length - 1;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: double.infinity,
      height: 56,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: _pages[_currentPage].gradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: _pages[_currentPage].gradient[0].withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _nextPage,
          borderRadius: BorderRadius.circular(16),
          splashColor: Colors.white.withOpacity(0.2),
          highlightColor: Colors.white.withOpacity(0.1),
          child: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  isLastPage ? 'Get Started' : 'Next',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  isLastPage ? Icons.check_circle : Icons.arrow_forward,
                  color: Colors.white,
                  size: 24,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class OnboardingPage {
  final String title;
  final String description;
  final IconData icon;
  final List<Color> gradient;
  final String? lottieAsset;

  OnboardingPage({
    required this.title,
    required this.description,
    required this.icon,
    required this.gradient,
    this.lottieAsset,
  });
}
