# Migration to Looma Labs Google Account

This guide will help you migrate SignaSure from your personal Google account to your Looma Labs organization account.

## Overview

You need to set up:
1. **Firebase Project** - For authentication (Google Sign-In)
2. **Google Gemini API** - For AI document analysis

**Estimated time**: 20-30 minutes

---

## Part 1: Firebase Setup (Looma Labs Account)

### Step 1: Create New Firebase Project

1. **Sign in to Firebase Console with Looma Labs account**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Sign in with your Looma Labs Google account
   - Click "Add project" or "Create a project"

2. **Create the project**
   - **Project name**: `SignaSure Production` (or any name you prefer)
   - Click "Continue"
   - **Enable Google Analytics**: Recommended (optional)
   - Select or create Analytics account if needed
   - Click "Create project"
   - Wait for setup to complete

### Step 2: Set Up Android App

1. **Add Android app to Firebase**
   - In Firebase Console → Project Overview
   - Click the Android icon to add an Android app

2. **Register app**
   - **Android package name**: `com.example.signasure`
     - ⚠️ **IMPORTANT**: You should change this to your own package name before publishing to Play Store
     - Recommended: `com.loomalabs.signasure` or similar
   - **App nickname**: `SignaSure Android` (optional)
   - **Debug signing certificate SHA-1**: Leave blank for now (we'll add later)
   - Click "Register app"

3. **Download google-services.json**
   - Click "Download google-services.json"
   - **Save this file** - you'll need it later
   - Click "Next" → "Next" → "Continue to console"

### Step 3: Enable Google Sign-In

1. **Go to Authentication**
   - In Firebase Console sidebar → Build → Authentication
   - Click "Get started"

2. **Enable Google Sign-In**
   - Go to "Sign-in method" tab
   - Click on "Google"
   - Toggle "Enable"
   - **Project support email**: Select your Looma Labs email
   - Click "Save"

### Step 4: Get SHA-1 Certificate Fingerprints

You need to add SHA-1 fingerprints for both **debug** and **release** builds.

#### Debug SHA-1 (for development)

Run this command in your project directory:

```bash
# On Windows
cd android
gradlew signingReport
```

Look for the **debug** keystore SHA-1. It will look like:
```
Variant: debug
SHA-1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

#### Release SHA-1 (for production)

If you've already created your upload keystore (from SIGNING_SETUP.md):

```bash
keytool -list -v -keystore android/app/upload-keystore.jks -alias upload
```

Enter your keystore password and copy the SHA-1.

If you **haven't created a keystore yet**, follow the [SIGNING_SETUP.md](SIGNING_SETUP.md) guide first.

#### Add SHA-1 to Firebase

1. **Go to Project Settings**
   - Firebase Console → Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Find your Android app

2. **Add fingerprints**
   - Click "Add fingerprint"
   - Paste **debug SHA-1** → Click "Save"
   - Click "Add fingerprint" again
   - Paste **release SHA-1** → Click "Save"

3. **Download updated google-services.json**
   - After adding fingerprints, download the **updated** `google-services.json`
   - You'll replace the old file with this one

---

## Part 2: Google Gemini API Setup (Looma Labs Account)

### Step 1: Get Gemini API Key

1. **Sign in to Google AI Studio with Looma Labs account**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your **Looma Labs Google account**
   - If prompted to agree to terms, accept them

2. **Create API Key**
   - Click "Create API Key"
   - Select "Create API key in new project" (or use existing project)
   - **Project name**: `SignaSure Gemini` (or any name)
   - Click "Create"
   - **Copy the API key** - it will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - ⚠️ **Save this key securely** - you won't see it again!

3. **Verify API is enabled**
   - The Gemini API should be automatically enabled
   - You can verify at [Google Cloud Console](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)

---

## Part 3: Update Your SignaSure App

Now you'll replace the old configuration with the new Looma Labs configuration.

### Step 1: Update Firebase Configuration Files

#### A. Replace google-services.json

```bash
# Navigate to your project
cd C:\Users\Isaiah\OneDrive\Documents\GitHub\SignaSure

# Backup old file (optional)
copy android\app\google-services.json android\app\google-services.json.backup

# Replace with the NEW file you downloaded from Firebase
# Copy your newly downloaded google-services.json to:
# android\app\google-services.json
```

**Manual steps:**
1. Locate the `google-services.json` file you downloaded in Step 2 Part 1
2. Copy it to: `C:\Users\Isaiah\OneDrive\Documents\GitHub\SignaSure\android\app\google-services.json`
3. Overwrite the existing file

#### B. Regenerate firebase_options.dart

Run FlutterFire CLI to automatically update your Firebase configuration:

```bash
# Make sure you're in the project root
cd C:\Users\Isaiah\OneDrive\Documents\GitHub\SignaSure

# Run FlutterFire configure (will use the new google-services.json)
flutterfire configure
```

**During configuration:**
- Select the **new Firebase project** you just created (SignaSure Production)
- Select platforms: **Android** (and iOS if needed)
- Confirm when asked to overwrite files

This will update `lib/firebase_options.dart` with your new Looma Labs Firebase configuration.

### Step 2: Update Gemini API Key

#### Update .env file

```bash
# Navigate to project root
cd C:\Users\Isaiah\OneDrive\Documents\GitHub\SignaSure

# Edit .env file (create if it doesn't exist)
notepad .env
```

Replace the content with your **new Looma Labs Gemini API key**:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Save and close the file.**

⚠️ **IMPORTANT**: Make sure `.env` is in your `.gitignore` so you don't commit your API key!

### Step 3: Verify .gitignore

Make sure your `.gitignore` includes:

```gitignore
# API Keys and Secrets
.env
*.env

# Firebase
google-services.json.backup

# Keystore files
*.jks
*.keystore
android/key.properties
```

---

## Part 4: Test Everything

### Step 1: Clean and Rebuild

```bash
# Clean the project
flutter clean

# Get dependencies
flutter pub get

# Rebuild the app
flutter run
```

### Step 2: Test Firebase Authentication

1. **Run the app**
2. **Sign out** if you're already signed in
3. **Sign in with Google**
   - Use any Google account (can be personal or Looma Labs)
   - Verify sign-in works correctly
   - Check that username prompt appears for new users

### Step 3: Test Gemini AI Analysis

1. **Scan or upload a document**
2. **Analyze it**
3. **Verify the analysis completes successfully**
4. If you get errors, check:
   - API key is correct in `.env`
   - `.env` file is in the project root
   - You ran `flutter pub get` after updating `.env`

### Step 4: Test Release Build

```bash
# Build release APK
flutter build apk --release

# Install on device
flutter install --release

# Test all features in release mode
```

**Critical tests for release:**
- ✅ Google Sign-In works
- ✅ Document scanning works
- ✅ AI analysis works
- ✅ History loads correctly
- ✅ No crashes

---

## Part 5: Update Package Name (Optional but Recommended)

For production, you should change from `com.example.signasure` to your own package name.

**Recommended**: `com.loomalabs.signasure`

### Update package name in:

1. **android/app/build.gradle.kts** (line 191, 214):
   ```kotlin
   namespace = "com.loomalabs.signasure"
   applicationId = "com.loomalabs.signasure"
   ```

2. **android/app/src/main/AndroidManifest.xml**:
   - Update package attribute if present

3. **Update folder structure**:
   ```bash
   # Rename the package folders
   android/app/src/main/kotlin/com/example/signasure
   # to
   android/app/src/main/kotlin/com/loomalabs/signasure
   ```

4. **Update MainActivity.kt**:
   ```kotlin
   package com.loomalabs.signasure
   ```

5. **Update Firebase**:
   - Go to Firebase Console → Project Settings
   - Add a new Android app with package name `com.loomalabs.signasure`
   - Download the new `google-services.json`
   - Run `flutterfire configure` again

---

## Part 6: Production Checklist

Before publishing to Play Store:

### Firebase
- ✅ Using Looma Labs Firebase project
- ✅ google-services.json updated
- ✅ firebase_options.dart regenerated
- ✅ Google Sign-In enabled
- ✅ Release SHA-1 fingerprint added

### Gemini API
- ✅ Using Looma Labs API key
- ✅ .env file updated
- ✅ API key tested and working
- ✅ .env added to .gitignore

### App Configuration
- ✅ Package name changed (recommended)
- ✅ Version updated in pubspec.yaml
- ✅ App signing configured (see SIGNING_SETUP.md)
- ✅ Tested in release mode
- ✅ All features working

### Legal Documents
- ✅ Company name changed to "Looma Labs"
- ✅ Contact email updated in:
  - PRIVACY_POLICY.md
  - TERMS_OF_SERVICE.md
  - README.md
- ✅ Privacy Policy URL ready
- ✅ Terms of Service URL ready

---

## Troubleshooting

### Google Sign-In Fails

**Error**: "Sign-in failed" or "PlatformException"

**Solution**:
1. Verify SHA-1 fingerprints are added to Firebase
2. Download the **latest** `google-services.json` after adding SHA-1
3. Run `flutterfire configure` again
4. Clean and rebuild: `flutter clean && flutter pub get && flutter run`

### Gemini API Not Working

**Error**: "API key not configured" or "401 Unauthorized"

**Solution**:
1. Check `.env` file exists in project root
2. Verify API key is correct (no extra spaces)
3. Run `flutter pub get`
4. Rebuild the app
5. Check API key is enabled at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Release Build Crashes

**Error**: App crashes immediately in release mode

**Solution**:
1. Check ProGuard rules in `android/app/proguard-rules.pro`
2. Verify `google-services.json` is in `android/app/`
3. Check SHA-1 for **release keystore** is added to Firebase
4. Run: `flutter build apk --release --verbose` to see detailed errors

### Wrong Firebase Project

**Error**: App connects to old Firebase project

**Solution**:
1. Delete `lib/firebase_options.dart`
2. Delete `android/app/google-services.json`
3. Download fresh files from **new** Firebase project
4. Run `flutterfire configure` and select the correct project
5. Clean and rebuild

---

## Important Security Notes

### Never Commit These Files:
- ❌ `.env` (contains API keys)
- ❌ `upload-keystore.jks` (your signing key)
- ❌ `android/key.properties` (keystore passwords)
- ✅ `google-services.json` (can be committed - no secrets)
- ✅ `firebase_options.dart` (can be committed - no secrets)

### Keep These Backed Up:
- 🔐 Upload keystore (`upload-keystore.jks`)
- 🔐 Keystore passwords
- 🔐 Gemini API key
- 🔐 Firebase project credentials

---

## Quick Reference

### File Locations

```
SignaSure/
├── .env                              # Gemini API key
├── android/
│   ├── app/
│   │   ├── google-services.json      # Firebase config (Android)
│   │   ├── upload-keystore.jks       # Release signing key
│   │   └── build.gradle.kts          # Package name, signing config
│   └── key.properties                # Keystore passwords
└── lib/
    └── firebase_options.dart          # Auto-generated Firebase config
```

### Commands Cheat Sheet

```bash
# Clean project
flutter clean && flutter pub get

# Regenerate Firebase config
flutterfire configure

# Get debug SHA-1
cd android && gradlew signingReport

# Get release SHA-1
keytool -list -v -keystore android/app/upload-keystore.jks -alias upload

# Build release
flutter build appbundle --release

# Test release
flutter run --release
```

---

## Next Steps

After completing this migration:

1. ✅ Test thoroughly in debug mode
2. ✅ Test thoroughly in release mode
3. ✅ Follow [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
4. ✅ Review [SIGNING_SETUP.md](SIGNING_SETUP.md) for app signing
5. ✅ Update legal documents with Looma Labs contact info
6. ✅ Build release bundle: `flutter build appbundle --release`
7. ✅ Upload to Play Store!

---

**Need help?**
- Firebase issues: [Firebase Support](https://firebase.google.com/support)
- Gemini API issues: [Google AI Studio](https://makersuite.google.com/)
- Flutter issues: [Flutter Docs](https://docs.flutter.dev/)

**Good luck with your Play Store launch! 🚀**
