import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'GapFinder AI — Personalized Learning Gap Detection System',
  description:
    'AI-powered diagnostic learning system that identifies knowledge gaps from student study materials, generates targeted quizzes, and builds adaptive revision plans.',
  keywords: [
    'learning gaps',
    'AI education',
    'diagnostic quizzes',
    'personalized revision plan',
    'RAG',
    'pgvector',
    'Deep Learning',
  ],
  authors: [{ name: 'GapFinder AI Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
