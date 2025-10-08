import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'screens/main_screen.dart';
import 'screens/landing_screen.dart';
import 'services/database_service.dart';
import 'services/auth_service.dart';
import 'providers/theme_provider.dart';
import 'providers/user_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    print('Error loading .env file: $e');
  }

  // Initialize Firebase
  try {
    await Firebase.initializeApp();
  } catch (e) {
    print('Firebase initialization error: $e');
  }

  await DatabaseService.database;

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
      ],
      child: const SignaSureApp(),
    ),
  );
}

class SignaSureApp extends StatelessWidget {
  const SignaSureApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final authService = AuthService();

    return MaterialApp(
      title: 'SignaSure',
      theme: themeProvider.lightTheme,
      darkTheme: themeProvider.darkTheme,
      themeMode: themeProvider.isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: StreamBuilder(
        stream: authService.authStateChanges,
        builder: (context, snapshot) {
          // Show loading while checking auth state
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }

          // Show landing page if not authenticated
          if (snapshot.data == null) {
            return const LandingScreen();
          }

          // Show main screen if authenticated
          final user = snapshot.data!;
          final userProvider = Provider.of<UserProvider>(context, listen: false);
          userProvider.updateUserName(user.displayName ?? 'User');

          return const MainScreen();
        },
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
