import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'screens/landing_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/user_data_loader.dart';
import 'services/database_service.dart';
import 'services/auth_service.dart';
import 'providers/theme_provider.dart';
import 'providers/user_provider.dart';
import 'providers/font_size_provider.dart';

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
        ChangeNotifierProvider(create: (_) => FontSizeProvider()),
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
      home: SplashScreen(
        child: StreamBuilder(
          stream: authService.authStateChanges,
          builder: (context, snapshot) {
            // Show landing page if not authenticated
            if (snapshot.data == null) {
              return const LandingScreen();
            }

            // Show user data loader which will load user data before showing main screen
            return const UserDataLoader();
          },
        ),
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
