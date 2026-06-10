import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthHashHandler from "./components/AuthHashHandler";
import AdsenseLoader from "./components/AdsenseLoader";
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

const BASE_URL = 'https://tabi-compuri.hana.trickster.biz'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: '旅コンプリ | 日本全国制覇アプリ',
    template: '%s | 旅コンプリ',
  },
  description: '47都道府県・市区町村・道の駅・温泉・お城など全国スポットを制覇しよう。旅の思い出を記録してランキングに挑戦できる無料の旅行制覇アプリ。',
  keywords: ['旅行', '旅行アプリ', '都道府県制覇', '旅行記録', '道の駅', '温泉', 'お城', '制覇', 'ゲーミフィケーション', '旅コンプリ', '日本一周', '旅行好き'],
  authors: [{ name: '株式会社華' }],
  creator: '株式会社華',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: '旅コンプリ | 日本全国制覇アプリ',
    description: '47都道府県・市区町村・道の駅・温泉・お城を制覇しよう。旅の思い出を記録して全国ランキングに挑戦。',
    url: BASE_URL,
    siteName: '旅コンプリ',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '旅コンプリ | 日本全国制覇アプリ',
    description: '47都道府県・市区町村・道の駅・温泉・お城を制覇しよう。旅の思い出を記録して全国ランキングに挑戦。',
    site: '@tabi_compuri',
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
      <body className="min-h-full flex flex-col pb-14 sm:pb-0">
        <AdsenseLoader />
        <AuthHashHandler />
        {children}
        <footer className="bg-white border-t text-center text-xs text-gray-400 py-2 px-4 flex gap-4 justify-center flex-wrap">
          <a href="/about" className="hover:text-gray-600">このアプリについて</a>
          <a href="/privacy" className="hover:text-gray-600">プライバシーポリシー</a>
          <a href="https://hana.trickster.biz/tokushoho.html" className="hover:text-gray-600">特定商取引法</a>
          <span>© 株式会社華</span>
        </footer>
      </body>
    </html>
  );
}
