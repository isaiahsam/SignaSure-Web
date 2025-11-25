# SignaSure

**Sign Smart, Stay Protected** 🔐

SignaSure is an AI-powered document analysis mobile app that helps you identify loopholes and unfavorable terms before signing any document.

[![Flutter](https://img.shields.io/badge/Flutter-3.7.2+-blue.svg)](https://flutter.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange.svg)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Free-green.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

### 🤖 AI-Powered Analysis
- **Real Google Gemini AI integration** (completely FREE!)
- Identifies hidden fees, unfavorable terms, and loopholes
- Highlights penalty clauses and automatic renewals
- Risk scoring (0-10 scale)
- Plain-English explanations of complex legal terms
- Actionable recommendations

### 📸 Multi-Page Scanning
- Scan documents using camera with visual feedback
- **NEW:** Image review page before analysis
- Capture multiple pages (3+ pages supported)
- Import from gallery
- OCR text extraction with Google ML Kit
- A4 document frame overlay for perfect alignment

### 📤 Document Upload
- Support for PDF, JPG, PNG, TXT, DOC, DOCX
- Multi-file upload
- Automatic document type detection
- File size display

### 📚 Smart History & Management
- View all analyzed documents
- **Pin favorites to top** - star important documents
- **Edit document names** - long-press to rename
- Delete with confirmation
- Search and filter by type
- Pull-to-refresh

### 🔐 Secure Authentication
- Google Sign-In integration
- **Custom username prompt** on first sign-in
- Firebase authentication
- Animated landing page
- Secure sign-out

### 🎨 Modern UI/UX
- Dark and light mode support
- Smooth animations and transitions
- Material Design 3
- Responsive layout
- Beautiful gradients and shadows

## 🚀 Quick Start

### Prerequisites

- Flutter SDK 3.7.2+
- Dart SDK 3.7.2+
- Android Studio / Xcode
- Google account (for Gemini API)
- Firebase project (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SignaSure.git
   cd SignaSure
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Set up Google Gemini AI** (5 minutes, FREE!)

   See [GEMINI_SETUP.md](GEMINI_SETUP.md) for detailed instructions.

   Quick setup:
   - Get free API key: https://makersuite.google.com/app/apikey
   - Add to `.env`: `GEMINI_API_KEY=your_key_here`

4. **Set up Firebase** (Required for authentication)

   See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for instructions.

   Quick setup:
   ```bash
   npm install -g firebase-tools
   dart pub global activate flutterfire_cli
   flutterfire configure
   ```

5. **Run the app**
   ```bash
   flutter run
   ```

## 📖 Documentation

- 🚀 **[Quick Start Guide](GEMINI_SETUP.md)** - Get started in 5 minutes
- 🔥 **[Firebase Setup](FIREBASE_SETUP.md)** - Authentication configuration
- ✅ **[Production Checklist](PRODUCTION_CHECKLIST.md)** - Play Store preparation
- 🔐 **[App Signing](SIGNING_SETUP.md)** - Release build setup
- 📜 **[Privacy Policy](PRIVACY_POLICY.md)** - User data handling
- 📋 **[Terms of Service](TERMS_OF_SERVICE.md)** - Legal terms

## 🏗️ Project Structure

```
lib/
├── main.dart                      # App entry point with dotenv
├── models/
│   └── document.dart             # Document and analysis models
├── providers/
│   ├── theme_provider.dart       # Dark/light mode management
│   └── user_provider.dart        # User data (username)
├── screens/
│   ├── landing_screen.dart       # Google Sign-In
│   ├── username_prompt_screen.dart  # NEW: Username input
│   ├── main_screen.dart          # Bottom navigation
│   ├── home_screen.dart          # Dashboard with pinned favorites
│   ├── scan_screen.dart          # Camera scanning with flash effect
│   ├── image_review_screen.dart  # NEW: Review before analysis
│   ├── upload_screen.dart        # File upload
│   ├── history_screen.dart       # Document history with edit/pin
│   ├── settings_screen.dart      # App settings
│   └── analysis_result_screen.dart  # AI analysis results
├── services/
│   ├── auth_service.dart         # Google authentication
│   ├── database_service.dart     # SQLite (favorites, custom titles)
│   ├── ocr_service.dart          # Google ML Kit OCR
│   └── ai_analysis_service.dart  # Gemini AI integration
└── assets/
    ├── images/                   # App logos
    └── .env                      # API keys (NOT committed)
```

## 🛠️ Technologies

| Technology | Purpose |
|-----------|---------|
| **Flutter 3.7.2+** | Cross-platform framework |
| **Google Gemini AI** | FREE AI document analysis |
| **Firebase** | Authentication & backend |
| **Google Sign-In** | OAuth authentication |
| **SQLite** | Local document storage |
| **Google ML Kit** | OCR text recognition |
| **Provider** | State management |
| **flutter_dotenv** | Environment variables |

## 💰 Cost Analysis

### Free Forever
- **Gemini AI**: 1,500 analyses/day (FREE!)
- **Firebase**: Authentication (FREE tier)
- **Google ML Kit**: OCR (FREE on-device)
- **Total**: $0/month for most users

### If You Exceed Free Tier
- **Gemini Pro**: $0.0006 per document (~$6 for 10,000 docs)
- Still **50% cheaper than GPT-4**!

## 🎯 Key Features in Detail

### AI Analysis Results Include:
- ⚠️ **Flags**: Hidden fees, unfavorable terms, loopholes
- 📋 **Important Clauses**: Simplified legal explanations
- 📊 **Risk Score**: 0-10 rating with color coding
- 💡 **Recommendations**: Actionable next steps

### User Experience Improvements:
- ✅ Visual feedback when capturing images (white flash)
- ✅ Review captured images before analyzing
- ✅ Pin favorite documents to top
- ✅ Edit document names (long-press)
- ✅ Custom username instead of Google display name
- ✅ Clean icon design (no colored boxes)

## 🔒 Security & Privacy

- ✅ API keys stored in `.env` (not committed)
- ✅ ProGuard obfuscation enabled
- ✅ Documents stored locally only
- ✅ HTTPS encryption for all API calls
- ✅ Firebase secure authentication
- ✅ No data sold to third parties

**See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for full details.**

## 🚢 Production Deployment

Ready to publish on Google Play Store?

1. **Follow [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)**
2. **Set up app signing**: [SIGNING_SETUP.md](SIGNING_SETUP.md)
3. **Get Gemini API key**: [GEMINI_SETUP.md](GEMINI_SETUP.md)
4. **Build release**: `flutter build appbundle --release`
5. **Upload to Play Console**

### Important Changes for Production:
- [ ] Change `applicationId` from `com.example.signasure`
- [ ] Add your own app signing keystore
- [ ] Update privacy policy URL
- [ ] Add real contact info in legal docs
- [ ] Get production Firebase config
- [ ] Test thoroughly in release mode

## 🧪 Testing

```bash
# Run tests
flutter test

# Test release build
flutter run --release

# Build for Android
flutter build apk --release
flutter build appbundle --release

# Build for iOS
flutter build ios --release
```

## 📱 Supported Platforms

- ✅ Android (minSdk 23+)
- ✅ iOS (coming soon)
- ⚠️ Web (OCR not supported)

## 🐛 Known Issues

- ⚠️ Java 8 warnings (fixed with gradle.properties)
- ⚠️ Requires good lighting for accurate OCR
- ⚠️ Very long documents may hit token limits

## 🗺️ Roadmap

- [x] Real AI analysis (Gemini integration)
- [x] Username customization
- [x] Image review before analysis
- [x] Favorite/pin documents
- [x] Edit document names
- [ ] Backend server for better API key security
- [ ] In-app subscriptions (optional)
- [ ] Document comparison
- [ ] PDF export of analysis
- [ ] Cloud sync (optional)
- [ ] Multiple language support
- [ ] iOS version

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## ⚖️ Legal Disclaimer

**SignaSure is NOT a substitute for professional legal advice.**

The AI analysis is for informational purposes only. Always consult a qualified attorney before signing important documents. See [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md) for full disclaimer.

## 📧 Support

- **Issues**: Open a GitHub issue
- **Email**: [your-email@example.com]
- **Docs**: Check the `/docs` folder

## 🙏 Acknowledgments

- Google Gemini AI team for the amazing free tier
- Flutter team for the framework
- Firebase for authentication
- Google ML Kit for OCR
- All open-source contributors

---

**Developed by Looma Labs**

**Made with ❤️ for safer document signing**

⭐ Star this repo if you find it helpful!
