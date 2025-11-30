# Privacy Policy for SignaSure

**Effective Date:** January 1, 2025
**Last Updated:** January 1, 2025

## Introduction

SignaSure ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile application.

## Information We Collect

### 1. Account Information
- **Google Account Data**: When you sign in with Google, we collect:
  - Email address
  - Display name
  - Profile picture (if available)
- **Purpose**: To create and manage your account

### 2. Document Data
- **Scanned Documents**: Photos and images you capture or upload
- **Extracted Text**: Text extracted from your documents via OCR
- **AI Analysis Results**: Analysis provided by Google Gemini AI
- **Purpose**: To provide document analysis services

### 3. Usage Data
- **Device Information**: Device model, operating system version
- **App Usage**: Features used, crash logs, performance data
- **Purpose**: To improve app functionality and fix bugs

## How We Use Your Information

We use your information to:
1. **Provide Services**: Analyze documents for potential issues and loopholes
2. **Improve Quality**: Enhance app features and user experience
3. **Communicate**: Send important updates about the service
4. **Security**: Protect against fraud and abuse

## Third-Party Services

### Google Services
We use the following Google services:
- **Google Sign-In**: For authentication
- **Google Gemini AI**: For document analysis
- **Firebase**: For authentication and analytics
- **Google ML Kit**: For text recognition (OCR)

These services have their own privacy policies:
- [Google Privacy Policy](https://policies.google.com/privacy)
- [Firebase Privacy](https://firebase.google.com/support/privacy)

### Data Sent to Google Gemini AI

⚠️ **CRITICAL PRIVACY NOTICE:**

When you analyze a document, the extracted text is sent to **Google's Gemini AI servers**. Here's what happens:

**What is Sent:**
- The text extracted from your document (contracts, leases, agreements, etc.)
- This may include: names, addresses, phone numbers, financial terms, legal clauses, and other contract details

**How Google Uses Your Data (Free Gemini API):**
- **Google may use your document text to improve their AI services**, including training machine learning models
- **Google may retain your data** beyond what's needed for immediate processing
- **Google employees may manually review** some content for quality assurance purposes
- Your data is governed by [Google's Privacy Policy](https://policies.google.com/privacy) and [Gemini API Terms](https://ai.google.dev/gemini-api/terms)

**What This Means:**
- ❌ **Your document content is NOT confidential from Google**
- ❌ **We cannot guarantee your data won't be used to train Google's AI**
- ❌ **We cannot guarantee how long Google retains your data**
- ✅ **Your document images stay on your device** - only extracted text is sent
- ✅ **We do NOT store your documents on our servers**
- ✅ **You can delete documents from your device at any time**

**Important:** Deleting a document from the app only removes it from your device. We cannot delete data that has already been sent to Google's servers.

## Data Storage and Security

### Local Storage
- Documents and analysis results are stored **locally on your device**
- We use SQLite database for local storage
- Data is NOT automatically backed up to our servers

### Security Measures
- All data transmission uses HTTPS encryption
- Firebase Authentication for secure login
- ProGuard obfuscation for code protection
- API keys are protected using industry-standard practices

### Data Retention
- **Account Data**: Retained while your account is active
- **Documents**: Stored locally until you delete them
- **Analysis Results**: Stored locally until you delete them

## Your Rights

You have the right to:
1. **Access**: View all data stored locally on your device
2. **Delete**: Remove documents and analysis results from your device anytime
3. **Export**: Request a copy of your data (local data only)
4. **Account Deletion**: Delete your account and all associated data from our systems

**IMPORTANT LIMITATION:**
- We can only delete data from **your device** and **our systems** (which don't store documents)
- **We CANNOT delete data that has been sent to Google's servers**
- Once document text is sent to Google for analysis, it's governed by Google's data retention policies
- For questions about Google's data handling, see [Google Privacy Policy](https://policies.google.com/privacy)

To exercise these rights, contact us at: [your-email@example.com]

## Children's Privacy

SignaSure is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.

## Data Sharing

### What We Do NOT Do:
- ❌ Sell your personal information
- ❌ Share your documents with third parties for marketing
- ❌ Use your documents to train our own AI models (we don't have any)
- ❌ Share data for advertising purposes
- ❌ Store your documents on our servers

### What We DO Share:
- ✅ **Document text with Google Gemini AI** for analysis (as detailed above)
  - **Google may use this data to train their AI models**
  - This is a requirement of using the free Gemini API
- ✅ Account information with Firebase (Google's authentication service)
- ✅ Data if required by law or legal process
- ✅ Data to protect our rights and prevent fraud

### Your Consent
**By using SignaSure, you consent to:**
1. Your document text being sent to Google's servers
2. Google using your data according to their privacy policy
3. The possibility that your data may be used to improve Google's AI services

## International Users

Your data may be processed in:
- United States (Google Cloud servers)
- Your local region (device storage)

By using SignaSure, you consent to this data transfer.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes by:
- Updating the "Last Updated" date
- Sending an in-app notification
- Posting a notice in the app

## Legal Disclaimer

**IMPORTANT**: SignaSure provides AI-powered analysis for informational purposes only. It is NOT a substitute for professional legal advice. Always consult a qualified attorney before signing important documents.

## Contact Us

If you have questions about this Privacy Policy or our practices, contact us:

**Email**: [your-email@example.com]
**Website**: [your-website.com]
**Address**: [Your business address]

---

## Your Consent

By using SignaSure, you consent to this Privacy Policy and agree to its terms.

---

**Note to Developer**: Before publishing:
1. Replace `[your-email@example.com]` with your actual contact email
2. Replace `[your-website.com]` with your website (or remove if none)
3. Add your business address if required by your jurisdiction
4. Review with a lawyer to ensure compliance with:
   - GDPR (if serving EU users)
   - CCPA (if serving California users)
   - Other applicable privacy laws
5. Host this on a public URL (required for Play Store)
