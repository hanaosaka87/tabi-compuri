import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
}

export const metadata: Metadata = {
  title: "旅コンプリ | 日本全国制覇アプリ",
  description: "日本47都道府県を制覇しよう。旅の思い出を記録して全国ランキングに挑戦。",
  openGraph: {
    title: "旅コンプリ | 日本全国制覇アプリ",
    description: "日本47都道府県を制覇しよう。旅の思い出を記録して全国ランキングに挑戦。",
    url: "https://tabi-compuri.hana.trickster.biz",
    siteName: "旅コンプリ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "旅コンプリ | 日本全国制覇アプリ",
    description: "日本47都道府県を制覇しよう。旅の思い出を記録して全国ランキングに挑戦。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-14 sm:pb-0">{children}</body>
    </html>
  );
}
