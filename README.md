# SignaSure

**Sign Smart, Stay Protected**

SignaSure is an AI-powered document analysis mobile app that helps you check for loopholes and unfavorable terms before signing any document.

## Features

### 🔍 Document Analysis
- AI-powered analysis to identify potential risks and loopholes
- Highlights unfavorable terms and clauses
- Provides recommendations and insights

### 📸 Multi-Page Scanning
- Scan multiple pages of a document
- Capture using camera or import from gallery
- OCR text extraction from images
- Support for documents with 3+ pages

### 📤 Document Upload
- Upload documents in multiple formats (PDF, JPG, PNG, TXT, DOC, DOCX)
- Multi-file upload support
- Automatic document type detection

### 📚 History & Management
- View all previously analyzed documents
- Delete documents with confirmation dialog
- Edit and manage document titles
- Favorite important documents

### 🔐 Authentication
- Google Sign-In integration
- Secure user authentication via Firebase
- Beautiful animated landing page

### 🎨 Modern UI
- Dark and light mode support
- Smooth animations and transitions
- Intuitive navigation
- Material Design principles

## Getting Started

### Prerequisites

- Flutter SDK (3.7.2 or higher)
- Dart SDK (3.7.2 or higher)
- Firebase project (for authentication)
- Android Studio / Xcode for mobile development

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

3. **Set up Firebase** (Required for authentication)

   Follow the detailed instructions in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

   Quick setup:
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Install FlutterFire CLI
   dart pub global activate flutterfire_cli

   # Configure Firebase
   flutterfire configure
   ```

4. **Run the app**
   ```bash
   flutter run
   ```

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/
│   └── document.dart        # Document data model
├── providers/
│   ├── theme_provider.dart  # Theme management
│   └── user_provider.dart   # User data management
├── screens/
│   ├── landing_screen.dart  # Landing page with Google Sign-In
│   ├── main_screen.dart     # Main app wrapper
│   ├── home_screen.dart     # Home dashboard
│   ├── scan_screen.dart     # Multi-page document scanning
│   ├── upload_screen.dart   # Document upload
│   ├── history_screen.dart  # Document history
│   ├── settings_screen.dart # App settings
│   └── analysis_result_screen.dart  # Analysis results
├── services/
│   ├── auth_service.dart       # Authentication logic
│   ├── database_service.dart   # Local database (SQLite)
│   ├── ocr_service.dart        # Text extraction
│   └── ai_analysis_service.dart # AI analysis (mock)
└── assets/
    └── images/
        ├── logo_blue.png    # Blue logo for white backgrounds
        └── logo_white.png   # White logo for blue backgrounds
```

## Technologies Used

- **Flutter** - Cross-platform mobile framework
- **Firebase** - Authentication and backend services
- **Google Sign-In** - OAuth authentication
- **SQLite** - Local database for document storage
- **Google ML Kit** - OCR and text recognition
- **Provider** - State management

## Features in Detail

### Multi-Page Scanning

Users can now scan documents with multiple pages:
1. Capture the first page using camera
2. App shows "X pages captured" indicator
3. Continue capturing more pages
4. Click "Done" when finished
5. All pages are combined into a single document

### Delete Confirmation

When deleting documents from the main screen, users are prompted with a confirmation dialog to prevent accidental deletions.

### History Persistence

Documents scanned or uploaded are now automatically saved and appear in the history section immediately after processing.

### Google Authentication

- Beautiful landing page with animated logo
- One-tap Google Sign-In
- Secure authentication via Firebase
- Sign-out option in settings

## Configuration

### Firebase Setup

Before running the app, you must configure Firebase. See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions.

### API Keys

For production use, you'll need to integrate a real AI analysis service. Currently, the app uses mock analysis data.

## Development

### Running Tests

```bash
flutter test
```

### Building for Production

**Android:**
```bash
flutter build apk --release
```

**iOS:**
```bash
flutter build ios --release
```

## Known Issues

- Firebase must be configured before the app can run
- AI analysis currently uses mock data (integrate real AI service for production)
- Some warnings from deprecated APIs (will be fixed in future updates)

## Future Enhancements

- [ ] Real AI analysis integration (OpenAI, Google AI, etc.)
- [ ] Document comparison feature
- [ ] Export analysis reports as PDF
- [ ] Cloud sync for documents
- [ ] Document sharing capabilities
- [ ] Offline mode support
- [ ] Multiple language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@signasure.com or open an issue in the repository.

## Acknowledgments

- Flutter team for the amazing framework
- Firebase for authentication services
- Google ML Kit for OCR capabilities

---

Made with ❤️ by SignaSure Team
