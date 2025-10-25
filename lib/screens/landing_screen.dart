import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../services/auth_service.dart';
import '../services/preferences_service.dart';
import '../providers/theme_provider.dart';
import 'onboarding_screen.dart';
import 'main_screen.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> with TickerProviderStateMixin {
  final AuthService _authService = AuthService();
  bool _isLoading = false;
  late AnimationController _logoController;
  late AnimationController _buttonController;
  late AnimationController _parallaxController;
  late Animation<double> _logoFadeAnimation;
  late Animation<double> _logoScaleAnimation;
  late Animation<Offset> _buttonSlideAnimation;
  late Animation<double> _buttonFadeAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _startAnimations();
  }

  void _setupAnimations() {
    // Logo animations
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _logoFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );

    _logoScaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.0, 0.6, curve: Curves.elasticOut),
      ),
    );

    // Button animations
    _buttonController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _buttonSlideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.5),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _buttonController,
        curve: Curves.easeOutCubic,
      ),
    );

    _buttonFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _buttonController,
        curve: Curves.easeOut,
      ),
    );

    // Parallax animation
    _parallaxController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat(reverse: true);
  }

  void _startAnimations() async {
    // Delay to allow splash transition to complete
    await Future.delayed(const Duration(milliseconds: 100));
    await _logoController.forward();
    await _buttonController.forward();
  }

  @override
  void dispose() {
    _logoController.dispose();
    _buttonController.dispose();
    _parallaxController.dispose();
    super.dispose();
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final userCredential = await _authService.signInWithGoogle();

      if (userCredential != null && userCredential.user != null) {
        // Check if user has completed onboarding
        final hasCompletedOnboarding = await PreferencesService.hasCompletedOnboarding();

        if (mounted) {
          if (hasCompletedOnboarding) {
            // Show animation and go directly to main screen
            Navigator.pushReplacement(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) => const MainScreen(),
                transitionsBuilder: (context, animation, secondaryAnimation, child) {
                  // Fade + scale animation
                  return FadeTransition(
                    opacity: animation,
                    child: ScaleTransition(
                      scale: Tween<double>(begin: 0.95, end: 1.0).animate(
                        CurvedAnimation(parent: animation, curve: Curves.easeOut),
                      ),
                      child: child,
                    ),
                  );
                },
                transitionDuration: const Duration(milliseconds: 600),
              ),
            );
          } else {
            // First time user - show onboarding tutorial
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const OnboardingScreen()),
            );
          }
        }

        Fluttertoast.showToast(
          msg: "Sign-in successful!",
          toastLength: Toast.LENGTH_SHORT,
        );
      }
    } catch (e) {
      print('Error during Google Sign-In: $e');
      Fluttertoast.showToast(
        msg: "Sign-in failed. Please try again.",
        toastLength: Toast.LENGTH_LONG,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode;

    return Scaffold(
      body: Stack(
        children: [
          // Animated parallax background
          AnimatedBuilder(
            animation: _parallaxController,
            builder: (context, child) {
              return Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: isDark
                        ? [
                            const Color(0xFF1A1A1A),
                            const Color(0xFF0A0A0A),
                          ]
                        : [
                            Colors.white,
                            const Color(0xFFF0F4FF),
                          ],
                  ),
                ),
                child: Stack(
                  children: [
                    // Floating shapes for parallax effect
                    ...List.generate(8, (index) {
                      final offsetX = (index % 4) * 100.0;
                      final offsetY = (index ~/ 4) * 200.0;
                      final movement = _parallaxController.value * 50 * (index % 2 == 0 ? 1 : -1);

                      return Positioned(
                        left: offsetX + movement,
                        top: offsetY + movement * 0.5,
                        child: Opacity(
                          opacity: isDark ? 0.05 : 0.1,
                          child: Container(
                            width: 100 + (index * 20),
                            height: 100 + (index * 20),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: RadialGradient(
                                colors: [
                                  const Color(0xFF2563EB).withOpacity(0.3),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              );
            },
          ),

          // Main content
          SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: screenWidth * 0.08),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
              const Spacer(flex: 2),

              // Animated Logo
              FadeTransition(
                opacity: _logoFadeAnimation,
                child: ScaleTransition(
                  scale: _logoScaleAnimation,
                  child: Column(
                    children: [
                      // Logo Image with Hero
                      Hero(
                        tag: 'app_logo',
                        child: Material(
                          color: Colors.transparent,
                          child: Image.asset(
                            isDark ? 'assets/images/logo_blue.png' : 'assets/images/logo_blue.png',
                            width: screenWidth * 0.6,
                            height: screenWidth * 0.2,
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Tagline
                      Text(
                        'Sign Smart, Stay Protected',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.grey[400] : Colors.grey[700],
                          letterSpacing: 0.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),

              const Spacer(flex: 1),

              // Description
              SlideTransition(
                position: _buttonSlideAnimation,
                child: FadeTransition(
                  opacity: _buttonFadeAnimation,
                  child: Column(
                    children: [
                      Text(
                        'AI-powered document analysis to check for loopholes and unfavorable terms before you sign',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 50),

                      // Google Sign-In Button
                      _isLoading
                          ? Column(
                              children: [
                                const SizedBox(
                                  width: 40,
                                  height: 40,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 3,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Signing in...',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                                  ),
                                ),
                              ],
                            )
                          : _AnimatedSignInButton(
                              onPressed: _handleGoogleSignIn,
                              isDark: isDark,
                            ),
                    ],
                  ),
                ),
              ),

              const Spacer(flex: 2),

              // Footer
              FadeTransition(
                opacity: _buttonFadeAnimation,
                child: Text(
                  '© 2025 SignaSure. All rights reserved.',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? Colors.grey[600] : Colors.grey[500],
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Animated Sign-In Button with hover effects
class _AnimatedSignInButton extends StatefulWidget {
  final VoidCallback onPressed;
  final bool isDark;

  const _AnimatedSignInButton({
    required this.onPressed,
    required this.isDark,
  });

  @override
  State<_AnimatedSignInButton> createState() => _AnimatedSignInButtonState();
}

class _AnimatedSignInButtonState extends State<_AnimatedSignInButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _hoverController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _elevationAnimation;

  @override
  void initState() {
    super.initState();
    _hoverController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.02).animate(
      CurvedAnimation(parent: _hoverController, curve: Curves.easeOut),
    );

    _elevationAnimation = Tween<double>(begin: 3.0, end: 8.0).animate(
      CurvedAnimation(parent: _hoverController, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _hoverController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) {
        _hoverController.forward();
      },
      onExit: (_) {
        _hoverController.reverse();
      },
      child: AnimatedBuilder(
        animation: _hoverController,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              width: double.infinity,
              height: 56,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF2563EB),
                    const Color(0xFF1E40AF),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2563EB)
                        .withOpacity(0.3 * _elevationAnimation.value / 8),
                    blurRadius: _elevationAnimation.value * 2,
                    offset: Offset(0, _elevationAnimation.value / 2),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: widget.onPressed,
                  borderRadius: BorderRadius.circular(12),
                  splashColor: Colors.white.withOpacity(0.3),
                  highlightColor: Colors.white.withOpacity(0.1),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.asset(
                          'assets/images/google_logo.png',
                          width: 24,
                          height: 24,
                          errorBuilder: (context, error, stackTrace) {
                            return const Icon(Icons.login, color: Colors.white, size: 24);
                          },
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'Sign in with Google',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
