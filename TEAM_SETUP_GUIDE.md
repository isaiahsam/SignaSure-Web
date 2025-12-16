# SignaSure - Complete Team Setup Guide

**Welcome to the SignaSure project!** This guide will walk you through setting up the project from scratch on your local machine.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Install Required Software](#install-required-software)
3. [Clone the Repository](#clone-the-repository)
4. [Get Required Files from Team Lead](#get-required-files-from-team-lead)
5. [Configure Your Local Environment](#configure-your-local-environment)
6. [Install Dependencies](#install-dependencies)
7. [Verify Setup](#verify-setup)
8. [Run the App](#run-the-app)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, you'll need:
- A Windows, macOS, or Linux computer
- At least 10 GB of free disk space
- Internet connection
- A Google account (for Gemini API key)

---

## Install Required Software

### Step 1: Install Git

**Windows:**
1. Download from: https://git-scm.com/download/win
2. Run the installer (use default settings)
3. Verify installation: Open Command Prompt and run:
   ```bash
   git --version
   ```

**macOS:**
```bash
# Using Homebrew
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

---

### Step 2: Install Flutter SDK

**Windows:**
1. Download Flutter SDK: https://docs.flutter.dev/get-started/install/windows
2. Extract the zip file to `C:\flutter` (or your preferred location)
3. Add Flutter to PATH:
   - Search for "Environment Variables" in Windows
   - Click "Environment Variables"
   - Under "User variables", find "Path" and click "Edit"
   - Click "New" and add `C:\flutter\bin`
   - Click "OK" to save
4. Verify installation:
   ```bash
   flutter --version
   ```

**macOS:**
```bash
cd ~/development
unzip ~/Downloads/flutter_macos_[version].zip
export PATH="$PATH:`pwd`/flutter/bin"
```

**Linux:**
```bash
cd ~/development
tar xf ~/Downloads/flutter_linux_[version].tar.xz
export PATH="$PATH:`pwd`/flutter/bin"
```

---

### Step 3: Install Android Studio

1. Download from: https://developer.android.com/studio
2. Run the installer
3. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
4. Launch Android Studio
5. Go to: Tools → SDK Manager
6. Under "SDK Platforms", install:
   - Android 13.0 (Tiramisu) - API Level 33
   - Android 12.0 (S) - API Level 31
7. Under "SDK Tools", install:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android SDK Platform-Tools
   - Android Emulator

**Note the Android SDK location** (you'll need it later):
- Usually: `C:\Users\YourUsername\AppData\Local\Android\Sdk` (Windows)
- Or: `/Users/YourUsername/Library/Android/sdk` (macOS)

---

### Step 4: Install Java Development Kit (JDK)

Android Studio usually includes JDK, but verify:

```bash
java -version
```

If not installed, download JDK 11 or higher from:
- https://adoptium.net/ (recommended)
- Or use Android Studio's embedded JDK

---

### Step 5: Install Node.js (for Firebase CLI)

1. Download from: https://nodejs.org/ (LTS version)
2. Run the installer
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

---

### Step 6: Install Firebase CLI & FlutterFire CLI

```bash
npm install -g firebase-tools
dart pub global activate flutterfire_cli
```

---

### Step 7: Run Flutter Doctor

This command checks your Flutter installation and identifies any missing components:

```bash
flutter doctor
```

**Expected output:**
```
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.7.2, on Windows 11)
[✓] Android toolchain - develop for Android devices (Android SDK version 33.0.0)
[✓] Android Studio (version 2023.1)
[✓] Connected device (1 available)
```

**Fix any issues** Flutter Doctor identifies before proceeding.

---

## Clone the Repository

### Step 1: Clone the Project

Open your terminal/command prompt and run:

```bash
# Navigate to where you want to store the project
cd C:\Users\YourUsername\Documents\GitHub

# Clone the repository
git clone https://github.com/yourusername/SignaSure.git

# Navigate into the project
cd SignaSure
```

---

### Step 2: Check Git Status

```bash
git status
```

You should see: `On branch main` and `nothing to commit, working tree clean`

**Note:** The `.gitignore` file is already in the repository, so you don't need to create it.

---

## Get Required Files from Team Lead

Contact your team lead to get the following files. These are **NOT** in the Git repository for security reasons.

### Required Files:

| File | Where to Place It | What It's For |
|------|-------------------|---------------|
| `google-services.json` | `android/app/` | Firebase Android configuration |
| `upload-keystore.jks` | `android/app/` | App signing keystore (for release builds) |
| `key.properties` | `android/` | Keystore passwords |
| `.env` template | Project root | API keys (or create your own) |

**Place the files in the exact locations specified above.**

---

## Configure Your Local Environment

### Step 1: Create `.env` File

Create a file named `.env` in the project root directory (same level as `pubspec.yaml`):

**Windows (using Command Prompt):**
```bash
echo # Google Gemini API Configuration > .env
```

**macOS/Linux:**
```bash
touch .env
```

**Open `.env` in a text editor and add:**

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get your Gemini API key:**
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Replace `your_gemini_api_key_here` with your actual key

**Example:**
```env
GEMINI_API_KEY=AIzaSyCTsQcw7mVdiFk2S8C3GqhGscdzyFxfwYg
```

---

### Step 2: Create `android/local.properties`

Create a file named `local.properties` in the `android/` folder:

**File location:** `android/local.properties`

**Content:**
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
flutter.sdk=C:\\flutter
flutter.buildMode=debug
flutter.versionName=1.0.0
flutter.versionCode=1
```

**IMPORTANT:** Replace the paths with YOUR actual paths:

**To find your Android SDK path:**
1. Open Android Studio
2. Go to: File → Settings (or Android Studio → Preferences on macOS)
3. Navigate to: Appearance & Behavior → System Settings → Android SDK
4. Copy the "Android SDK Location" path
5. **On Windows**, use double backslashes (`\\`) in the path

**To find your Flutter SDK path:**
```bash
where flutter    # Windows
which flutter    # macOS/Linux
```
The path is everything before `/bin/flutter`

**Example for Windows:**
```properties
sdk.dir=C:\\Users\\Isaiah\\AppData\\Local\\Android\\Sdk
flutter.sdk=C:\\flutter
flutter.buildMode=debug
flutter.versionName=1.0.0
flutter.versionCode=1
```

**Example for macOS:**
```properties
sdk.dir=/Users/YourUsername/Library/Android/sdk
flutter.sdk=/Users/YourUsername/development/flutter
flutter.buildMode=debug
flutter.versionName=1.0.0
flutter.versionCode=1
```

---

### Step 3: Verify File Structure

Your project should now have these files:

```
SignaSure/
├── .env                          ✓ You created this
├── .gitignore                    ✓ From Git (already there)
├── pubspec.yaml                  ✓ From Git
├── README.md                     ✓ From Git
├── firebase.json                 ✓ From Git
├── android/
│   ├── app/
│   │   ├── google-services.json  ✓ From team lead
│   │   └── upload-keystore.jks   ✓ From team lead
│   ├── key.properties            ✓ From team lead
│   └── local.properties          ✓ You created this
├── lib/
│   └── ... (all Flutter code)
└── assets/
    └── ...
```

---

## Install Dependencies

### Step 1: Get Flutter Packages

```bash
flutter pub get
```

You should see:
```
Running "flutter pub get" in SignaSure...
Resolving dependencies...
Got dependencies!
```

---

### Step 2: Clean and Rebuild (Optional but Recommended)

```bash
flutter clean
flutter pub get
```

---

## Verify Setup

### Step 1: Run Flutter Doctor

```bash
flutter doctor -v
```

All checks should pass (✓). Fix any issues before continuing.

---

### Step 2: Check for Code Issues

```bash
flutter analyze
```

You should see:
```
Analyzing SignaSure...
No issues found!
```

---

### Step 3: Verify Environment Variables

Create a test to ensure `.env` is loaded correctly:

```bash
flutter run --dart-define=CHECK_ENV=true
```

If there are issues with the API key, the app will show an error.

---

## Run the App

### Step 1: Set Up an Android Emulator

**Option A: Create a Virtual Device**
1. Open Android Studio
2. Go to: Tools → Device Manager (or AVD Manager)
3. Click "Create Device"
4. Select a phone (e.g., Pixel 6)
5. Select a system image (e.g., Android 13.0)
6. Click "Finish"
7. Start the emulator by clicking the "Play" button

**Option B: Use a Physical Device**
1. Enable Developer Options on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back → Developer Options
   - Enable "USB Debugging"
2. Connect your phone via USB
3. Accept the USB debugging prompt on your phone

---

### Step 2: Check Connected Devices

```bash
flutter devices
```

You should see your emulator or physical device listed.

**Example output:**
```
2 connected devices:

sdk gphone64 arm64 (mobile) • emulator-5554 • android-arm64  • Android 13 (API 33)
Chrome (web)                • chrome        • web-javascript • Google Chrome 120.0
```

---

### Step 3: Run the App in Debug Mode

```bash
flutter run
```

**What happens:**
1. Flutter builds the app (first time takes 2-5 minutes)
2. Installs the app on your device/emulator
3. Launches the app
4. Shows the console output

**You should see the SignaSure app launch with the landing screen!**

---

### Step 4: Hot Reload (While the App is Running)

When you make code changes:
- Press `r` in the terminal for hot reload
- Press `R` for hot restart
- Press `q` to quit

---

## Troubleshooting

### Issue 1: "Unable to find google-services.json"

**Error:**
```
File google-services.json is missing
```

**Solution:**
- Ensure `google-services.json` is in `android/app/` directory
- Check the file name (no spaces, correct extension)
- Request the file from your team lead if you don't have it

---

### Issue 2: "Flutter SDK not found"

**Error:**
```
Unable to locate Android SDK
```

**Solution:**
- Open `android/local.properties`
- Verify the `sdk.dir` path is correct
- Make sure to use double backslashes on Windows: `C:\\Users\\...`

---

### Issue 3: "GEMINI_API_KEY not found"

**Error:**
```
Error: GEMINI_API_KEY not configured
```

**Solution:**
- Check that `.env` file exists in the project root
- Verify the file name is exactly `.env` (not `.env.txt`)
- Ensure the API key is on the line: `GEMINI_API_KEY=your_key_here`
- Run `flutter clean && flutter pub get`

---

### Issue 4: "Gradle build failed"

**Error:**
```
FAILURE: Build failed with an exception
```

**Common Solutions:**

**A) Clean and rebuild:**
```bash
flutter clean
cd android
./gradlew clean     # macOS/Linux
gradlew.bat clean   # Windows
cd ..
flutter pub get
flutter run
```

**B) Check Java version:**
```bash
java -version
```
Should be Java 11 or higher.

**C) Check `android/gradle.properties`:**
Ensure it has:
```properties
org.gradle.jvmargs=-Xmx8G -XX:MaxMetaspaceSize=4G
android.useAndroidX=true
android.enableJetifier=true
```

---

### Issue 5: "Signing configuration not found"

**Error:**
```
Could not read key from keystore
```

**Solution:**
- Only happens when building release builds
- Ensure `android/key.properties` exists with correct passwords
- Ensure `android/app/upload-keystore.jks` exists
- For development, use debug builds: `flutter run` (not `flutter run --release`)

---

### Issue 6: "No connected devices"

**Solution:**

**For Emulator:**
```bash
# List available emulators
emulator -list-avds

# Start an emulator
emulator -avd Pixel_6_API_33
```

**For Physical Device:**
```bash
# Check if device is connected (Android)
adb devices
```

If no devices shown:
- Restart adb: `adb kill-server && adb start-server`
- Reconnect your device
- Check USB debugging is enabled

---

### Issue 7: "Package not found" errors

**Solution:**
```bash
flutter pub get
flutter pub upgrade
flutter clean
flutter pub get
```

---

## Testing Your Setup

### Test Checklist:

Run these commands to verify everything works:

```bash
# 1. Check Flutter installation
flutter doctor -v

# 2. Check for code issues
flutter analyze

# 3. Check connected devices
flutter devices

# 4. Run the app
flutter run
```

**If all commands succeed, you're ready to develop!**

---

## Next Steps

### Familiarize Yourself with the Codebase

```
lib/
├── main.dart                      # App entry point
├── models/                        # Data models
│   └── document.dart
├── providers/                     # State management
│   ├── theme_provider.dart
│   └── user_provider.dart
├── screens/                       # UI screens
│   ├── landing_screen.dart        # Login screen
│   ├── home_screen.dart           # Dashboard
│   ├── scan_screen.dart           # Camera scanning
│   ├── upload_screen.dart         # File upload
│   ├── history_screen.dart        # Document history
│   └── analysis_result_screen.dart # AI results
└── services/                      # Business logic
    ├── auth_service.dart          # Google authentication
    ├── database_service.dart      # SQLite database
    ├── ocr_service.dart           # Text recognition
    └── ai_analysis_service.dart   # Gemini AI integration
```

---

### Development Workflow

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Create a new branch for your feature:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**

4. **Test your changes:**
   ```bash
   flutter analyze
   flutter run
   ```

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

6. **Push to remote:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

---

### Building Release Versions

**APK (for testing):**
```bash
flutter build apk --release
```
Output: `build/app/outputs/flutter-apk/app-release.apk`

**App Bundle (for Play Store):**
```bash
flutter build appbundle --release
```
Output: `build/app/outputs/bundle/release/app-release.aab`

---

## Important Security Notes

### NEVER Commit These Files to Git:

- `.env` - Contains API keys
- `android/key.properties` - Contains passwords
- `android/app/upload-keystore.jks` - Signing key
- `android/app/google-services.json` - Firebase config
- `android/local.properties` - Local paths

**These files are already in `.gitignore`** so they won't be committed accidentally. But always double-check before pushing!

---

## Useful Commands Reference

```bash
# Flutter Commands
flutter doctor              # Check installation
flutter devices             # List connected devices
flutter run                 # Run in debug mode
flutter run --release       # Run in release mode
flutter build apk           # Build APK
flutter build appbundle     # Build App Bundle
flutter clean               # Clean build cache
flutter pub get             # Get dependencies
flutter pub upgrade         # Upgrade dependencies
flutter analyze             # Check for issues

# Git Commands
git status                  # Check current status
git pull                    # Pull latest changes
git checkout -b branch-name # Create new branch
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push                    # Push to remote

# Android Debug Bridge (ADB)
adb devices                 # List connected devices
adb logcat                  # View device logs
adb kill-server             # Restart ADB
adb start-server            # Start ADB
```

---

## Getting Help

### Resources:
- **Project README:** `README.md` in the repository
- **Flutter Docs:** https://flutter.dev/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Gemini API Docs:** https://ai.google.dev/

### Contact:
- **Team Lead:** [Contact info]
- **GitHub Issues:** Open an issue in the repository
- **Team Chat:** [Slack/Discord/Teams channel]

---

## Summary

You've successfully set up SignaSure! Here's what you accomplished:

- ✓ Installed Flutter, Android Studio, and all required tools
- ✓ Cloned the repository
- ✓ Configured environment variables
- ✓ Set up Firebase and API keys
- ✓ Ran the app successfully

**Welcome to the team!**

---

**Last Updated:** December 2025
**Version:** 1.0.0
**Developed by Looma Labs**
