# SignaSure

**Sign Smart, Stay Protected**

SignaSure is an AI-powered document analysis web app that helps you identify loopholes and unfavorable terms before signing any document.

## Features

### AI-Powered Analysis
- **Google Gemini 2.5 Flash** integration
- Identifies hidden fees, unfavorable terms, and loopholes
- Highlights penalty clauses and automatic renewals
- Risk scoring (0-10 scale)
- Plain-English explanations of complex legal terms
- Fairness assessment for contract balance
- Actionable recommendations

### Document Upload
- Support for PDF, JPG, PNG images
- Drag-and-drop upload
- OCR text extraction with Tesseract.js
- Automatic document type detection

### Smart History & Management
- View all analyzed documents
- Pin favorites to top
- Edit document names
- Delete with confirmation
- Search and filter by type

### Secure Authentication
- Google Sign-In integration
- Firebase authentication
- Secure sign-out

### Modern UI/UX
- Dark and light mode support
- Smooth animations and transitions
- Responsive layout
- Beautiful gradients and shadows

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **Tailwind CSS** | Utility-first styling |
| **Firebase** | Authentication & Firestore database |
| **Google Gemini AI** | AI document analysis |
| **Tesseract.js** | Browser-based OCR |
| **Zustand** | State management |
| **React Query** | Server state management |

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Auth and Firestore enabled
- Google AI API key (Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SignaSure.git
   cd SignaSure
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google AI (Gemini)
   GOOGLE_AI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles & animations
│   ├── (auth)/
│   │   └── login/page.tsx          # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout with sidebar
│   │   ├── dashboard/page.tsx      # Home dashboard
│   │   ├── upload/page.tsx         # Upload documents
│   │   ├── analysis/[id]/page.tsx  # Analysis results
│   │   ├── history/page.tsx        # Document history
│   │   └── settings/page.tsx       # Settings
│   └── api/
│       └── analyze/route.ts        # Gemini API endpoint
├── components/
│   ├── ui/                         # Button, Card, Tabs, Toast, etc.
│   ├── layout/                     # Header, Sidebar, Footer
│   ├── auth/                       # GoogleSignInButton, AuthGuard
│   ├── documents/                  # UploadDropzone, DocumentCard
│   └── analysis/                   # RiskScoreCard, FlagsTab, ClausesTab
├── lib/
│   ├── firebase/                   # config.ts, auth.ts, firestore.ts
│   ├── gemini/                     # client.ts, prompts.ts
│   └── ocr/                        # tesseract.ts
├── hooks/                          # useAuth, useDocuments, useRateLimit
├── stores/                         # auth-store, theme-store
└── types/                          # document.ts, analysis.ts
```

## Rate Limits

- **5 analyses per hour**
- **20 analyses per day**

Rate limits reset automatically. Usage is tracked per user.

## Security & Privacy

- API keys stored in environment variables
- Documents stored in user's Firestore collection
- HTTPS encryption for all API calls
- Firebase secure authentication
- No data sold to third parties

**See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for full details.**

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Build for Production

```bash
npm run build
npm start
```

## Legal Disclaimer

**SignaSure is NOT a substitute for professional legal advice.**

The AI analysis is for informational purposes only. Always consult a qualified attorney before signing important documents. See [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md) for full disclaimer.

## License

This project is licensed under the MIT License.

---

**Developed by Looma Labs**
