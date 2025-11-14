import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { UserLevelProviderWithErrorBoundary } from "@/components/providers/UserLevelProvider";
import { LevelDrawer } from "@/components/shared/LevelDrawer";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const DOMAIN = 'https://quiz.huuvan.dev';
const TITLE = "Anton Questions - Practice, Learn, and Level Up"
const DESCRIPTION = "Master your knowledge with thousands of questions across multiple topics and difficulty levels. Track your progress, earn XP, and compete on leaderboards.";

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN || 'http://localhost:4000'),
  title: {
    default: TITLE,
    template: '%s | Anton Questions'
  },
  description: DESCRIPTION,
  keywords: ['quiz app', 'practice questions', 'learning platform', 'knowledge assessment', 'skill development', 'leaderboard', 'progress tracking'],
  authors: [{ name: 'Anton Questions Team' }],
  creator: 'Anton Questions',
  publisher: 'Anton Questions',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: DOMAIN,
    siteName: 'Anton Questions',
    locale: 'en_US',
    images: [
      {
        url: `${DOMAIN}/screenshots/question.png`,
        width: 1200,
        height: 630,
        alt: 'Anton Questions - Interactive question interface with multiple choice options',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: '@antonquestions',
    images: [`${DOMAIN}/screenshots/question.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification tokens here when available
    // google: 'your-google-verification-token',
    // yandex: 'your-yandex-verification-token',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg-peach`}
      >
        <QueryProvider>
          <UserLevelProviderWithErrorBoundary>
            <Header />
            {children}
            <LevelDrawer />
            <Toaster />
          </UserLevelProviderWithErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
