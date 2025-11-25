# Looma Labs Migration - Quick Summary

## ✅ What's Been Updated

### Branding Changes
- ✅ Changed "SignaSure Inc." to "Looma Labs" in:
  - `assets/legal/terms_of_service.md`
  - `SIGNING_SETUP.md`
  - `README.md`
  - `pubspec.yaml`

### Documentation Created
- ✅ Created comprehensive migration guide: `LOOMA_LABS_MIGRATION.md`

---

## 🚀 What You Need to Do Now

Follow the steps in **[LOOMA_LABS_MIGRATION.md](LOOMA_LABS_MIGRATION.md)** to:

### 1. Set Up Firebase (15 minutes)
- Create new Firebase project in Looma Labs account
- Add Android app
- Enable Google Sign-In
- Get SHA-1 fingerprints
- Download `google-services.json`

### 2. Set Up Gemini API (5 minutes)
- Get API key from Google AI Studio using Looma Labs account
- Update `.env` file with new API key

### 3. Update Your App (10 minutes)
- Replace `google-services.json`
- Run `flutterfire configure`
- Update `.env` file
- Test everything

---

## 📋 Quick Start Checklist

### Firebase Setup
1. [ ] Sign in to [Firebase Console](https://console.firebase.google.com/) with Looma Labs
2. [ ] Create new project: "SignaSure Production"
3. [ ] Add Android app with package: `com.example.signasure`
4. [ ] Download `google-services.json`
5. [ ] Enable Google Sign-In authentication
6. [ ] Get debug SHA-1: `cd android && gradlew signingReport`
7. [ ] Get release SHA-1: `keytool -list -v -keystore android/app/upload-keystore.jks -alias upload`
8. [ ] Add both SHA-1 fingerprints to Firebase
9. [ ] Download updated `google-services.json`

### Gemini API Setup
10. [ ] Go to [Google AI Studio](https://makersuite.google.com/app/apikey) (Looma Labs account)
11. [ ] Create API key
12. [ ] Copy the key (save it somewhere safe!)

### Update App
13. [ ] Replace `android/app/google-services.json` with new file
14. [ ] Run: `flutterfire configure`
15. [ ] Update `.env` with new Gemini API key
16. [ ] Run: `flutter clean && flutter pub get`
17. [ ] Test: `flutter run`

### Testing
18. [ ] Test Google Sign-In (debug)
19. [ ] Test Gemini AI analysis (debug)
20. [ ] Test release build: `flutter build apk --release`
21. [ ] Test Google Sign-In (release)
22. [ ] Test Gemini AI analysis (release)

---

## ⚠️ Before Play Store Launch

### Required Updates
- [ ] Change package name from `com.example.signasure` to `com.loomalabs.signasure`
- [ ] Update contact email in legal docs (replace `[your-email@example.com]`)
- [ ] Host Privacy Policy and Terms of Service online
- [ ] Create app signing keystore (if not done yet)
- [ ] Test thoroughly in release mode

### Legal Documents to Update
1. **PRIVACY_POLICY.md** - Lines 84, 126, 127, 128
2. **TERMS_OF_SERVICE.md** - Lines 191, 192, 193
3. **assets/legal/terms_of_service.md** - Lines 167, 168
4. **assets/legal/privacy_policy.md** - Check for contact info

Replace all instances of `[your-email@example.com]` with your Looma Labs email.

---

## 📁 Files You'll Need to Update

```
Your Actions:
├── android/app/google-services.json  ← Replace with new file from Firebase
├── .env                              ← Update with new Gemini API key
└── Run: flutterfire configure        ← Auto-updates firebase_options.dart

Future (Before Play Store):
├── android/app/build.gradle.kts      ← Update package name
├── PRIVACY_POLICY.md                 ← Add contact email
└── TERMS_OF_SERVICE.md               ← Add contact email
```

---

## 🆘 Common Issues

### "Google Sign-In Failed"
- Make sure SHA-1 fingerprints are added to Firebase
- Download latest `google-services.json` after adding SHA-1
- Run `flutterfire configure` again

### "API Key Not Configured"
- Check `.env` file exists in project root
- Verify API key has no extra spaces
- Run `flutter pub get` after updating `.env`

### "App Crashes in Release"
- Verify release SHA-1 is added to Firebase
- Make sure `google-services.json` is in `android/app/`
- Clean and rebuild: `flutter clean && flutter build apk --release`

---

## 📚 Reference Documents

- **[LOOMA_LABS_MIGRATION.md](LOOMA_LABS_MIGRATION.md)** - Full step-by-step guide
- **[SIGNING_SETUP.md](SIGNING_SETUP.md)** - App signing for Play Store
- **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** - Pre-launch checklist

---

## 🎯 Estimated Time

- **Firebase Setup**: 15 minutes
- **Gemini API Setup**: 5 minutes
- **App Update**: 10 minutes
- **Testing**: 15 minutes
- **Total**: ~45 minutes

---

**Ready to start? Open [LOOMA_LABS_MIGRATION.md](LOOMA_LABS_MIGRATION.md) and follow Part 1!**
