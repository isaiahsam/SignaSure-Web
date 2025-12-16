# SignaSure - Quick Start Checklist

**Get up and running in 30 minutes!**

---

## Before You Start

- [ ] Install Flutter SDK 3.7.2+
- [ ] Install Android Studio + Android SDK
- [ ] Install Git
- [ ] Get configuration files from team lead

---

## Setup Steps

### 1. Clone Repository (2 min)

```bash
git clone https://github.com/yourusername/SignaSure.git
cd SignaSure
```

---

### 2. Place Configuration Files (5 min)

Copy these files from your team lead to the correct locations:

```
SignaSure/
├── .env                               ← Place here (or create your own)
├── firebase.json                      ← Place here
└── android/
    ├── app/
    │   ├── google-services.json       ← Place here
    │   └── upload-keystore.jks        ← Place here
    └── key.properties                 ← Place here
```

---

### 3. Create `.env` File (3 min)

Create `.env` in project root:

```env
GEMINI_API_KEY=your_api_key_here
```

Get your free API key: https://makersuite.google.com/app/apikey

---

### 4. Create `android/local.properties` (2 min)

Create `android/local.properties` with YOUR paths:

```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
flutter.sdk=C:\\flutter
flutter.buildMode=debug
flutter.versionName=1.0.0
flutter.versionCode=1
```

**Find your Android SDK path:**
- Android Studio → File → Settings → System Settings → Android SDK
- Copy the "Android SDK Location"

**Find your Flutter SDK path:**
```bash
where flutter    # Windows
which flutter    # macOS/Linux
```

---

### 5. Install Dependencies (3 min)

```bash
flutter pub get
```

---

### 6. Verify Setup (2 min)

```bash
flutter doctor -v
flutter analyze
```

Fix any issues before continuing.

---

### 7. Start an Emulator or Connect Device (5 min)

**Option A: Android Emulator**
- Open Android Studio → Tools → Device Manager
- Create/Start a virtual device

**Option B: Physical Device**
- Enable USB Debugging on your phone
- Connect via USB

**Verify:**
```bash
flutter devices
```

You should see at least one device listed.

---

### 8. Run the App (10 min)

```bash
flutter run
```

First build takes 5-10 minutes. Subsequent builds are faster.

**You should see the SignaSure login screen!**

---

## Common Issues & Quick Fixes

### "google-services.json not found"
- Ensure the file is in `android/app/` (not `android/`)

### "Flutter SDK not found"
- Check `android/local.properties` has correct paths
- Use double backslashes on Windows: `C:\\Users\\...`

### "GEMINI_API_KEY not found"
- Check `.env` file exists in project root
- Verify no extra spaces: `GEMINI_API_KEY=AIzaSy...`

### Gradle build failed
```bash
flutter clean
flutter pub get
flutter run
```

### No devices found
```bash
# Restart ADB
adb kill-server
adb start-server

# Check devices
adb devices
flutter devices
```

---

## Essential Commands

```bash
# Development
flutter run              # Run app in debug mode
flutter run --release    # Run app in release mode (needs keystore)

# Maintenance
flutter clean            # Clean build cache
flutter pub get          # Get dependencies
flutter doctor           # Check installation

# Building
flutter build apk        # Build APK (needs keystore)
flutter build appbundle  # Build App Bundle (needs keystore)

# Git
git status               # Check status
git pull                 # Get latest changes
git checkout -b feature  # Create new branch
```

---

## File Structure Reference

```
lib/
├── main.dart                      # App entry point
├── screens/                       # All UI screens
│   ├── landing_screen.dart        # Login
│   ├── home_screen.dart           # Dashboard
│   ├── scan_screen.dart           # Camera
│   ├── upload_screen.dart         # File upload
│   ├── history_screen.dart        # History
│   └── analysis_result_screen.dart # Results
├── services/                      # Business logic
│   ├── auth_service.dart          # Authentication
│   ├── ai_analysis_service.dart   # Gemini AI
│   ├── ocr_service.dart           # Text recognition
│   └── database_service.dart      # SQLite
├── models/                        # Data models
└── providers/                     # State management
```

---

## Development Workflow

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes & test:**
   ```bash
   flutter run
   # Make code changes
   # Press 'r' for hot reload
   ```

4. **Analyze & commit:**
   ```bash
   flutter analyze
   git add .
   git commit -m "Your message"
   git push origin feature/your-feature
   ```

5. **Create Pull Request on GitHub**

---

## Need Help?

- **Full Setup Guide:** See `TEAM_SETUP_GUIDE.md`
- **Files to Request:** See `FILES_TO_SHARE.md`
- **Project Docs:** See `README.md`
- **Team Lead:** [Contact info]

---

## Verification Checklist

Before asking for help, verify:

- [ ] Flutter Doctor shows all green checkmarks
- [ ] `flutter devices` shows at least one device
- [ ] All config files are in correct locations
- [ ] `.env` file has valid API key
- [ ] `android/local.properties` has correct paths
- [ ] You ran `flutter pub get`
- [ ] You tried `flutter clean`

---

**That's it! You're ready to develop!**

Happy coding! 🚀
