# SignaSure Setup Guide

Welcome to SignaSure! This guide will help you set up the app for production use with your own API keys.

## Prerequisites

Before you begin, make sure you have:
- A Google account
- Flutter SDK installed (for building the app)
- Android Studio or Xcode (depending on your target platform)

## Step 1: Get Your Gemini API Key

SignaSure uses Google's Gemini AI to analyze documents. You'll need your own API key to use the app.

### How to Get a Gemini API Key:

1. **Visit Google AI Studio**
   - Go to: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create an API Key**
   - Click on "Get API Key" or "Create API Key"
   - Select "Create API key in new project" (or use an existing project)
   - Copy the generated API key (it starts with "AIza...")
   - **IMPORTANT**: Save this key securely - you won't be able to see it again!

3. **API Key Pricing**
   - Google offers a generous **FREE tier** for Gemini API
   - Free tier includes: 15 requests per minute, 1 million tokens per minute
   - This is usually more than enough for personal use!
   - Check current pricing: https://ai.google.dev/pricing

## Step 2: Configure the App

When you first launch SignaSure, you'll be prompted to enter your Gemini API key. You can also configure it later from Settings.

### In-App Setup:

1. **Launch the App**
   - Open SignaSure on your device

2. **API Setup Screen**
   - On first launch, you'll see the API setup screen
   - Click "Get API Key from Google AI Studio" to open the browser
   - Follow the steps to get your key

3. **Enter Your API Key**
   - Paste your Gemini API key into the text field
   - Click "Test API Key" to verify it works
   - Click "Save" or "Continue"

4. **Done!**
   - You're now ready to analyze documents!

### Manual Setup via Settings:

1. Open the app and navigate to **Settings**
2. Scroll to **API Configuration**
3. Tap on **Gemini API Key**
4. Enter your API key and save

## Step 3: Using the App

Now that you've configured your API key, you can:

1. **Scan Documents** - Use your camera to capture documents
2. **Upload Files** - Import PDFs or images from your device
3. **Analyze** - The AI will analyze for risks, flags, and important clauses
4. **Review** - Get plain English explanations and signing recommendations

## Firebase Setup (Optional)

SignaSure currently uses Firebase for authentication. If you want to use your own Firebase project:

### Option A: Remove Firebase (Recommended for Simplicity)

If you don't need user authentication, you can remove Firebase:

1. **Remove Firebase dependencies** from `pubspec.yaml`:
   ```yaml
   # Comment out or remove these:
   # firebase_core: ^3.6.0
   # firebase_auth: ^5.3.1
   # google_sign_in: ^6.2.1
   ```

2. **Update main.dart** to remove Firebase initialization:
   ```dart
   // Remove or comment out Firebase.initializeApp()
   ```

3. **Simplify authentication**:
   - Remove the landing screen authentication flow
   - Make the app go directly to the main screen

### Option B: Use Your Own Firebase Project

If you want to keep Firebase authentication:

1. **Create a Firebase Project**
   - Go to: https://console.firebase.google.com/
   - Click "Add project"
   - Follow the setup wizard

2. **Add Your App**
   - Click "Add app" and select Android/iOS
   - Follow the platform-specific instructions
   - Download `google-services.json` (Android) or `GoogleService-Info.plist` (iOS)

3. **Replace Configuration Files**
   - Android: Place `google-services.json` in `android/app/`
   - iOS: Add `GoogleService-Info.plist` to your Xcode project

4. **Enable Authentication**
   - In Firebase Console, go to Authentication
   - Enable "Google" as a sign-in method
   - Add your app's SHA-1 fingerprint (Android)

## Security Best Practices

### API Key Security:

1. **Never commit API keys to git**
   - The `.gitignore` file is configured to exclude sensitive files
   - API keys are stored locally on the user's device only

2. **User-Provided Keys**
   - Each user provides their own API key
   - You (the developer) don't have access to user keys
   - Users control their own API usage and costs

3. **Key Storage**
   - API keys are stored using `shared_preferences`
   - Keys are encrypted on the device
   - Keys never leave the user's device

### Firebase Security:

1. **If using Firebase**:
   - Never commit `google-services.json` or `GoogleService-Info.plist`
   - These are already in `.gitignore`
   - Each developer/user should use their own Firebase project

2. **Production Build**:
   - Users should configure their own Firebase project
   - Or remove Firebase entirely if not needed

## Building for Production

### Android:

1. **Update Package Name** (if desired):
   - Edit `android/app/build.gradle`
   - Change `applicationId` to your own package name

2. **Generate Signing Key**:
   ```bash
   keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

3. **Configure Signing**:
   - Create `android/key.properties`
   - Add signing configuration to `build.gradle`

4. **Build Release APK**:
   ```bash
   flutter build apk --release
   ```

### iOS:

1. **Update Bundle Identifier**:
   - Open `ios/Runner.xcworkspace` in Xcode
   - Update Bundle Identifier

2. **Configure Signing**:
   - Select your development team
   - Configure provisioning profile

3. **Build**:
   ```bash
   flutter build ios --release
   ```

## Troubleshooting

### "API key not configured" error:
- Make sure you've entered your Gemini API key in Settings
- Verify the key starts with "AIza" and is 39 characters long
- Test the key using the "Test API Key" button

### "API analysis failed" error:
- Check your internet connection
- Verify your API key is valid
- Check if you've exceeded your free tier limits
- Visit Google AI Studio to check your quota

### Firebase initialization error:
- If not using Firebase, you can ignore this warning
- Or remove Firebase dependencies entirely (see above)

## Getting Help

If you encounter issues:

1. Check this guide first
2. Review the Privacy Policy and Terms of Service in the app
3. Visit the GitHub repository for updates
4. Create an issue on GitHub with:
   - Device information
   - Steps to reproduce
   - Error messages (if any)

## Important Legal Notice

⚠️ **SignaSure is NOT a substitute for legal advice**

- Always consult with a qualified attorney before signing legal documents
- The AI analysis is for informational purposes only
- Use at your own risk
- See Terms of Service and Privacy Policy for full details

## Additional Resources

- **Gemini API Documentation**: https://ai.google.dev/docs
- **Gemini API Pricing**: https://ai.google.dev/pricing
- **Flutter Documentation**: https://flutter.dev/docs
- **Firebase Documentation**: https://firebase.google.com/docs

---

**Happy Analyzing! 📄✨**

Remember: This app empowers you to understand documents better, but always seek professional legal advice for important decisions.
