import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';
import '../providers/theme_provider.dart';
import '../providers/font_size_provider.dart';
import '../services/auth_service.dart';
import 'main_screen.dart';

class UserDataLoader extends StatefulWidget {
  const UserDataLoader({super.key});

  @override
  State<UserDataLoader> createState() => _UserDataLoaderState();
}

class _UserDataLoaderState extends State<UserDataLoader> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final user = AuthService().currentUser;
    if (user == null) return;

    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final fontSizeProvider = Provider.of<FontSizeProvider>(context, listen: false);

    // Load all user data
    await userProvider.loadUserData(user.uid);
    await themeProvider.loadTheme(user.uid);
    await fontSizeProvider.loadFontSize(user.uid);

    // Always use Google display name (first name only)
    if (user.displayName != null) {
      // Extract first name only
      final firstName = user.displayName!.split(' ').first;
      await userProvider.updateUserName(firstName);
    }

    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return const MainScreen();
  }
}
