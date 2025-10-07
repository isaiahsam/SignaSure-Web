# Firebase Setup Instructions

## Before Running the App

Since Firebase requires platform-specific configuration files, you'll need to set up Firebase for your project. Follow these steps:

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Install FlutterFire CLI

```bash
dart pub global activate flutterfire_cli
```

### 4. Configure Firebase for your Flutter project

Run this command in your project directory:

```bash
flutterfire configure
```

This will:
- Create a Firebase project (or select an existing one)
- Register your app with Firebase
- Generate the necessary configuration files:
  - `lib/firebase_options.dart`
  - `android/app/google-services.json` (for Android)
  - `ios/Runner/GoogleService-Info.plist` (for iOS)

### 5. Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication > Sign-in method
4. Enable "Google" as a sign-in provider
5. Add your support email

### 6. Update Firebase Initialization

After running `flutterfire configure`, update `lib/main.dart` to import the generated options:

```dart
import 'firebase_options.dart';

// In main() function:
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

## Alternative: Skip Firebase Setup for Testing

If you want to test the app without Firebase authentication:

1. Comment out the Firebase initialization in `lib/main.dart`
2. Modify `lib/screens/landing_screen.dart` to skip authentication
3. Or create a mock authentication service

## Troubleshooting

- **Firebase initialization error**: Make sure you've run `flutterfire configure`
- **Google Sign-In not working**: Ensure you've enabled Google Sign-In in Firebase Console
- **SHA-1 fingerprint required**: For Android, add your debug and release SHA-1 fingerprints in Firebase Console > Project Settings > Your Apps
