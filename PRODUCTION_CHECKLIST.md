# Production Checklist for Google Play Store

## ✅ Pre-Launch Checklist

### 1. Application ID & Branding
- [ ] Change `applicationId` from `com.example.signasure` to your own (e.g., `com.yourcompany.signasure`)
  - File: `android/app/build.gradle.kts` line 27
- [ ] Update app name if needed
  - File: `android/app/src/main/AndroidManifest.xml`
- [ ] Add app icon in all sizes
  - Location: `android/app/src/main/res/mipmap-*/`
  - Use [Icon Generator](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

### 2. API Keys & Security
- [ ] Get Google Gemini API key from https://makersuite.google.com/app/apikey
- [ ] Add API key to `.env` file (NEVER commit this file!)
- [ ] Verify `.env` is in `.gitignore`
- [ ] Enable ProGuard (already configured)
- [ ] Test with release build: `flutter build apk --release`

### 3. App Signing
- [ ] Create upload keystore:
```bash
keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```
- [ ] Create `android/key.properties`:
```properties
storePassword=<password from previous step>
keyPassword=<password from previous step>
keyAlias=upload
storeFile=<location of upload-keystore.jks>
```
- [ ] Update `android/app/build.gradle.kts` to use keystore (see SIGNING_SETUP.md)
- [ ] **NEVER** commit `key.properties` or `.jks` files to git!

### 4. Permissions & Privacy
- [ ] Review permissions in `AndroidManifest.xml`
  - Camera (required for scanning)
  - Storage (required for saving documents)
  - Internet (required for AI analysis)
- [ ] Create Privacy Policy (see PRIVACY_POLICY.md)
- [ ] Host privacy policy on a public URL
- [ ] Update privacy policy URL in Play Store listing

### 5. Legal Documents
- [ ] Create Terms of Service (see TERMS_OF_SERVICE.md)
- [ ] Add disclaimers about AI analysis accuracy
- [ ] Add "not a substitute for legal advice" warning
- [ ] Consider consulting a lawyer for liability protection

### 6. Firebase Configuration
- [ ] Verify `google-services.json` is for production Firebase project
- [ ] Enable Google Sign-In in Firebase Console
- [ ] Add SHA-1 fingerprint for release keystore to Firebase
- [ ] Test authentication with release build

### 7. Version & Build Numbers
- [ ] Update version in `pubspec.yaml`:
```yaml
version: 1.0.0+1  # version name + build number
```
- [ ] Follow semantic versioning for updates

### 8. Testing
- [ ] Test all features in release mode: `flutter run --release`
- [ ] Test on multiple device sizes (phone, tablet)
- [ ] Test with slow internet connection
- [ ] Test offline mode gracefully handles errors
- [ ] Test Google Sign-In flow completely
- [ ] Test document scanning with various lighting
- [ ] Test AI analysis with real documents
- [ ] Check for memory leaks with long sessions

### 9. App Store Assets
- [ ] App screenshots (minimum 2, recommended 8)
  - Phone: 1080x1920 to 7680x4320
- [ ] Feature graphic: 1024x500
- [ ] App icon: 512x512 PNG
- [ ] Promotional video (optional but recommended)
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)

### 10. Monetization (Optional)
- [ ] Decide on pricing model:
  - Free with limited analyses
  - Freemium (in-app purchases)
  - Subscription model
  - One-time purchase
- [ ] Implement billing if needed
- [ ] Set up Play Console billing

### 11. Analytics & Monitoring
- [ ] Set up Firebase Analytics
- [ ] Set up Crashlytics for crash reporting
- [ ] Add analytics events for key actions
- [ ] Monitor API usage in Gemini Console

### 12. Build & Upload
- [ ] Build release AAB: `flutter build appbundle --release`
- [ ] Test AAB locally before upload
- [ ] Upload to Play Console (Internal Testing first!)
- [ ] Test with internal testers
- [ ] Move to Closed Testing (optional)
- [ ] Move to Production when ready

## 📝 Important Notes

### API Key Security
The Gemini API key is embedded in the app. To protect it:
1. ProGuard obfuscation is enabled (makes reverse engineering harder)
2. Set usage quotas in Google Cloud Console
3. Monitor usage for abuse
4. Consider backend server for better security (future upgrade)

### Recommended Architecture for Scaling
When you get 1000+ users, migrate to:
1. **Backend Server** (Firebase Functions, Node.js, etc.)
2. Server stores API key securely
3. App calls your backend instead of Gemini directly
4. Better control over costs and security

### Cost Management
- Free tier: 1500 requests/day per API key
- Monitor usage: https://console.cloud.google.com/
- Set billing alerts
- Consider caching common document analyses

## 🚨 Security Warnings

**NEVER commit these files:**
- `.env` - Contains API keys
- `key.properties` - Contains keystore passwords
- `upload-keystore.jks` - Your signing key
- `google-services.json` with production credentials (debatable, but safer)

**Add to `.gitignore`:**
```
.env
key.properties
*.jks
*.keystore
```

## 📚 Additional Resources

- [Flutter deployment guide](https://docs.flutter.dev/deployment/android)
- [Play Store requirements](https://support.google.com/googleplay/android-developer/answer/9859152)
- [Google Gemini API docs](https://ai.google.dev/docs)
- [Firebase setup](https://firebase.google.com/docs/flutter/setup)

---

**Ready for production?** Follow this checklist step by step! ✨
