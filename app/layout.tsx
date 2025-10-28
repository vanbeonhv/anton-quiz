import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";
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

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN || 'http://localhost:4000'),
  title: "Anton Quiz - Kiến Thức Nền Tảng Cho Lập Trình Viên ",
  description: "Củng cố kiến thức lý thuyết và giải quyết các tình huống thực tế. Từ concepts cơ bản đến advanced patterns. Hiểu sâu, code giỏi",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Anton Quiz - Vững Lý Thuyết, Giỏi Thực Chiến",
    description: "🎓 Kiến thức nền tảng • Case study thực tế • Phân tích scenario • Chuẩn bị phỏng vấn technical",
    type: "website",
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Questions App Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anton Quiz - Hiểu Bản Chất, Không Chỉ Nhớ Code",
    description: "Master concepts, solve real problems",
    images: ['/logo.svg'],
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
          <Header />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
