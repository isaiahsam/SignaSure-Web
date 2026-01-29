import Link from 'next/link';
import { FileText, ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - SignaSure',
  description: 'Privacy Policy for SignaSure AI-powered legal document analysis platform.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">SignaSure</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-primary-100 text-lg">
              Your privacy is important to us. Learn how we collect, use, and protect your data.
            </p>
            <p className="text-primary-200 text-sm mt-2">
              Last updated: January 29, 2025
            </p>
          </div>

          {/* Privacy Content */}
          <div className="px-8 py-10 space-y-10">
            {/* Introduction */}
            <section>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                LoomaLabs (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates SignaSure, an AI-powered legal document
                analysis platform. This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our Service.
              </p>
            </section>

            {/* Section 1 */}
            <section className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
                  <Database className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    1. Information We Collect
                  </h2>
                  <div className="text-slate-600 dark:text-slate-400 space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Account Information
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Name and email address (via Google Sign-In)</li>
                        <li>Profile picture (from your Google account)</li>
                        <li>Account creation and last login timestamps</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Document Information
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Documents you upload for analysis</li>
                        <li>Extracted text from your documents</li>
                        <li>Document type and metadata (file name, size, type)</li>
                        <li>Analysis results and history</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Usage Information
                      </h3>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Number of documents analyzed</li>
                        <li>Features used within the Service</li>
                        <li>Browser type and device information</li>
                        <li>IP address and general location</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    2. How We Use Your Information
                  </h2>
                  <div className="text-slate-600 dark:text-slate-400 space-y-3">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>Provide, maintain, and improve the Service</li>
                      <li>Process and analyze your documents using AI technology</li>
                      <li>Store your document analysis history for your reference</li>
                      <li>Enforce usage limits and prevent abuse</li>
                      <li>Communicate with you about the Service</li>
                      <li>Respond to your inquiries and support requests</li>
                      <li>Protect the security and integrity of the Service</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    3. Data Security
                  </h2>
                  <div className="text-slate-600 dark:text-slate-400 space-y-3">
                    <p>
                      We implement appropriate technical and organizational security measures to
                      protect your personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>All data transmission is encrypted using HTTPS/TLS</li>
                      <li>Documents are stored securely in Firebase/Google Cloud infrastructure</li>
                      <li>Access to user data is restricted and monitored</li>
                      <li>We use secure authentication via Google Sign-In</li>
                      <li>Regular security assessments and updates</li>
                    </ul>
                    <p className="mt-4 text-sm">
                      However, no method of transmission over the Internet or electronic storage is
                      100% secure. While we strive to protect your information, we cannot guarantee
                      absolute security.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    4. Third-Party Services
                  </h2>
                  <div className="text-slate-600 dark:text-slate-400 space-y-4">
                    <p>We use the following third-party services to provide the Service:</p>
                    <div className="space-y-4">
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          Google Firebase
                        </h4>
                        <p className="text-sm">
                          Authentication, database, and file storage. Subject to Google&apos;s Privacy Policy.
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          Google Gemini AI
                        </h4>
                        <p className="text-sm">
                          AI-powered document analysis. Document text is sent to Google&apos;s AI for processing.
                          Subject to Google&apos;s AI Terms of Service and Privacy Policy.
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          Tesseract.js (OCR)
                        </h4>
                        <p className="text-sm">
                          Text extraction from images and scanned PDFs. Processing occurs in your browser.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    5. Data Retention and Deletion
                  </h2>
                  <div className="text-slate-600 dark:text-slate-400 space-y-3">
                    <p>
                      We retain your data for as long as your account is active or as needed to
                      provide you with the Service. You can:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>Delete individual documents and their analyses from your dashboard</li>
                      <li>Request complete deletion of your account and all associated data</li>
                      <li>Export your analysis history before deletion</li>
                    </ul>
                    <p className="mt-4">
                      To request account deletion, please contact us at the email address below.
                      We will process your request within 30 days.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                6. Your Rights
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3">
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to certain processing of your data</li>
                  <li><strong>Restriction:</strong> Request restriction of processing</li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us using the information below.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                7. Cookies and Tracking
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3">
                <p>
                  We use essential cookies and local storage to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintain your authentication session</li>
                  <li>Remember your preferences (such as dark mode)</li>
                  <li>Ensure the Service functions properly</li>
                </ul>
                <p className="mt-4">
                  We do not use third-party advertising cookies or tracking pixels.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                8. Children&apos;s Privacy
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3">
                <p>
                  The Service is not intended for children under the age of 18. We do not knowingly
                  collect personal information from children. If you believe we have collected
                  information from a child, please contact us immediately.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                9. Changes to This Policy
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any
                  significant changes by posting the new policy on this page and updating the
                  &quot;Last updated&quot; date. We encourage you to review this policy periodically.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                10. Contact Us
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-4">
                <p>
                  If you have any questions about this Privacy Policy or our data practices,
                  please contact us:
                </p>
                <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl border border-primary-200 dark:border-primary-800">
                  <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">LoomaLabs</p>
                    <a
                      href="mailto:contact.loomalabs@gmail.com"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      contact.loomalabs@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Summary Box */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/30 dark:to-blue-900/30 rounded-xl border border-primary-200 dark:border-primary-800">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Privacy at a Glance
                  </h3>
                  <ul className="text-slate-600 dark:text-slate-400 space-y-1 text-sm">
                    <li>We collect only what&apos;s necessary to provide the Service</li>
                    <li>Your documents are encrypted and stored securely</li>
                    <li>We don&apos;t sell your personal information</li>
                    <li>You can delete your data at any time</li>
                    <li>We use industry-standard security practices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} LoomaLabs. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:text-primary-600 dark:hover:text-primary-400">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
