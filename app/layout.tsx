import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Med Spa Growth Audit — Find Your Revenue Leaks',
  description:
    'Answer 11 quick questions. Get a personalized growth score and strategy built for your med spa — free.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
