import Link from 'next/link';
import { FileText, ArrowLeft, AlertTriangle, Scale, Shield, Mail } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - SignaSure',
  description: 'Terms of Service for SignaSure AI-powered legal document analysis platform.',
};

export default function TermsOfServicePage() {
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
              <Scale className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-primary-100 text-lg">
              Please read these terms carefully before using SignaSure.
            </p>
            <p className="text-primary-200 text-sm mt-2">
              Last updated: January 29, 2025
            </p>
          </div>

          {/* Important Notice */}
          <div className="mx-8 -mt-6 mb-8">
            <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-6">
              <div className="flex gap-4">
                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
                    Important Legal Notice
                  </h2>
                  <p className="text-amber-700 dark:text-amber-300 font-medium">
                    SignaSure is NOT a substitute for professional legal advice. Our AI-powered analysis
                    is for informational and educational purposes only. You should ALWAYS consult with
                    a qualified attorney before making legal decisions or signing any legal documents.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="px-8 pb-12 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">1</span>
                Acceptance of Terms
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 pl-10">
                <p>
                  By accessing or using SignaSure (&quot;the Service&quot;), operated by LoomaLabs (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
                  you agree to be bound by these Terms of Service. If you do not agree to these terms,
                  please do not use the Service.
                </p>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of the Service
                  after any modifications constitutes acceptance of the updated terms.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">2</span>
                Description of Service
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 pl-10">
                <p>
                  SignaSure provides AI-powered analysis of legal documents to help users understand
                  contracts, identify potential risks, and receive general information about legal terms.
                  The Service includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Document text extraction using OCR technology</li>
                  <li>AI-powered analysis of contract terms and conditions</li>
                  <li>Risk assessment scores and flags</li>
                  <li>Plain-language explanations of legal clauses</li>
                  <li>General recommendations based on document analysis</li>
                </ul>
              </div>
            </section>

            {/* Section 3 - Critical */}
            <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 -mx-2">
              <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 flex items-center justify-center text-sm font-bold">3</span>
                Not Legal Advice - Critical Disclaimer
              </h2>
              <div className="text-red-700 dark:text-red-300 space-y-3 pl-10">
                <p className="font-semibold text-lg">
                  THE SERVICE DOES NOT PROVIDE LEGAL ADVICE.
                </p>
                <p>
                  SignaSure is an AI-powered informational tool. It is NOT a law firm and does NOT
                  provide legal services. The analysis, recommendations, and information provided by
                  SignaSure:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 font-medium">
                  <li>Do NOT constitute legal advice</li>
                  <li>Do NOT create an attorney-client relationship</li>
                  <li>Should NOT be relied upon as a substitute for professional legal counsel</li>
                  <li>May NOT be accurate, complete, or applicable to your specific situation</li>
                  <li>Should NOT be used as the sole basis for any legal decision</li>
                </ul>
                <p className="font-semibold mt-4">
                  You should ALWAYS consult with a qualified attorney licensed in your jurisdiction
                  before signing any legal document or making legal decisions. Laws vary by jurisdiction,
                  and only a licensed attorney can provide advice tailored to your specific circumstances.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">4</span>
                User Responsibilities
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 pl-10">
                <p>By using the Service, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate information and documents</li>
                  <li>Use the Service only for lawful purposes</li>
                  <li>Not upload documents containing malware or harmful content</li>
                  <li>Not attempt to circumvent security measures or rate limits</li>
                  <li>Not use the Service to commit fraud or deceive others</li>
                  <li>Accept full responsibility for decisions made based on the Service&apos;s analysis</li>
                  <li>Seek professional legal advice for important legal matters</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">5</span>
                Intellectual Property
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 pl-10">
                <p>
                  The Service, including its design, features, and content, is owned by LoomaLabs and
                  protected by intellectual property laws. You retain ownership of documents you upload,
                  but grant us a limited license to process them for providing the Service.
                </p>
                <p>
                  You may not copy, modify, distribute, or create derivative works of the Service
                  without our express written permission.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">6</span>
                Limitation of Liability
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 pl-10">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOOMALABS AND ITS AFFILIATES SHALL NOT BE
                  LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                  INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Loss of profits, revenue, or business opportunities</li>
                  <li>Legal fees or costs arising from reliance on the Service</li>
                  <li>Damages resulting from signing unfavorable contracts</li>
                  <li>Any decisions made based on the Service&apos;s analysis</li>
                  <li>Errors or inaccuracies in the AI-generated analysis</li>
                </ul>
                <p className="mt-4">
                  The Service is provided &quot;AS IS&quot; without warranties of any kind. We do not warrant
                  that the Service will be error-free, uninterrupted, or meet your specific requirements.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">7</span>
                AI Technology Limitations
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 pl-10">
                <p>
                  SignaSure uses artificial intelligence technology, which has inherent limitations:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AI may misinterpret or miss important clauses</li>
                  <li>Analysis may not account for jurisdiction-specific laws</li>
                  <li>Results may vary based on document quality and format</li>
                  <li>AI cannot understand context outside the document</li>
                  <li>Technology cannot replace human legal judgment</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">8</span>
                Account Termination
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 pl-10">
                <p>
                  We reserve the right to suspend or terminate your account at any time for violation
                  of these terms, abusive behavior, or any other reason at our discretion. Upon
                  termination, your right to use the Service ceases immediately.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">9</span>
                Governing Law
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 pl-10">
                <p>
                  These Terms of Service shall be governed by and construed in accordance with
                  applicable laws. Any disputes arising from these terms or the use of the Service
                  shall be resolved through appropriate legal channels.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">10</span>
                Contact Information
              </h2>
              <div className="text-slate-600 dark:text-slate-400 space-y-3 pl-10">
                <p>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="flex items-center gap-2 mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Mail className="h-5 w-5 text-primary-600" />
                  <a
                    href="mailto:contact.loomalabs@gmail.com"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    contact.loomalabs@gmail.com
                  </a>
                </div>
              </div>
            </section>

            {/* Final Notice */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4 p-6 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <Shield className="h-8 w-8 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Your Protection Matters
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    By using SignaSure, you acknowledge that you have read, understood, and agree to
                    be bound by these Terms of Service. Remember: always seek professional legal
                    advice for important legal matters. SignaSure is a helpful tool, but it cannot
                    replace the expertise of a qualified attorney.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} LoomaLabs. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400">
              Privacy Policy
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
