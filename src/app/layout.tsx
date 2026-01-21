import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SignaSure - AI-Powered Legal Document Analysis',
  description:
    'Understand your contracts in plain English. SignaSure uses AI to analyze legal documents, identify risks, and provide clear recommendations.',
  keywords: [
    'legal document analysis',
    'contract analysis',
    'AI legal assistant',
    'document review',
    'risk assessment',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
