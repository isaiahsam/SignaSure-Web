import type { Metadata } from 'next';
import { Inter, MuseoModerno } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });
const museoModerno = MuseoModerno({
  subsets: ['latin'],
  variable: '--font-museo-moderno',
  weight: ['400', '500', '600', '700', '800'],
});

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
  icons: {
    icon: 'https://res.cloudinary.com/dfi78jkbg/image/upload/v1769678443/Signasure_Logo_hk2zit.png',
    apple: 'https://res.cloudinary.com/dfi78jkbg/image/upload/v1769678443/Signasure_Logo_hk2zit.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${museoModerno.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
