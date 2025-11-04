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
const TITLE = "Anton Quiz - App Trắc Nghiệm Nâng Cao Kiến Thức Developer Chỉ 5 Phút/Ngày"
const DESCRIPTION = "Mệt mỏi vì kiến thức bị mai một? Cần ôn luyện 'thực chiến' cho phỏng vấn cấp cao hay dự án phức tạp? Anton Quiz là giải pháp Micro-Learning được thiết kế đặc biệt cho Developer chuyên nghiệp. Biến 5 phút rảnh rỗi thành lợi thế cạnh tranh của bạn.";

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN || 'http://localhost:4000'),
  title: TITLE,
  description: DESCRIPTION,
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
    images: [
      {
        url: `${DOMAIN}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Anton Quiz Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${DOMAIN}/logo.png`],
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
