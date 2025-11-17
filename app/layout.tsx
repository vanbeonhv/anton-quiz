import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { UserLevelProviderWithErrorBoundary } from "@/components/providers/UserLevelProvider";
import { LevelDrawer } from "@/components/shared/LevelDrawer";
import { Toaster } from "sonner";

// Google Fonts for better aesthetics
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Keep Geist fonts as fallback
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
const TITLE = "Anton Quiz - Practice Questions & Interactive Learning Platform"
const DESCRIPTION = "Anton Quiz is an interactive learning platform with thousands of practice questions. Track your progress, compete on leaderboards, and master knowledge across multiple difficulty levels.";

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN || 'http://localhost:4000'),
  title: {
    default: TITLE,
    template: '%s | Anton Quiz'
  },
  description: DESCRIPTION,
  keywords: [
    'anton quiz',
    'anton questions',
    'quiz app',
    'practice questions',
    'interactive quiz',
    'learning platform',
    'online quiz',
    'knowledge assessment',
    'skill development',
    'quiz game',
    'educational quiz',
    'leaderboard quiz',
    'progress tracking',
    'study questions',
    'test preparation'
  ],
  authors: [{ name: 'Anton Quiz Team' }],
  creator: 'Anton Quiz',
  publisher: 'Anton Quiz',
  applicationName: 'Anton Quiz',
  category: 'Education',
  classification: 'Educational Quiz Platform',
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
    siteName: 'Anton Quiz',
    locale: 'en_US',
    images: [
      {
        url: `${DOMAIN}/screenshots/question.png`,
        width: 1200,
        height: 630,
        alt: 'Anton Quiz - Interactive question interface with multiple choice options',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: '@antonquiz',
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
  alternates: {
    canonical: DOMAIN,
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
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Anton Quiz',
    alternateName: 'Anton Questions',
    url: DOMAIN,
    description: DESCRIPTION,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    featureList: [
      'Practice questions with multiple difficulty levels',
      'Real-time progress tracking and statistics',
      'Leaderboard and competitive rankings',
      'Tag-based question organization',
      'XP and level system',
      'Streak tracking',
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-bg-peach font-sans`}
        style={{ fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif' }}
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
