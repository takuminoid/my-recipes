import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Recipes",
  description: "自炊レシピ記録帳",
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
      <body className="min-h-full flex flex-col">
        <header className="bg-terra px-6 py-3.5 flex items-center justify-between shadow-md">
          <Link href="/" className="text-white text-xl font-bold tracking-wide no-underline">
            🍳 My Recipes
          </Link>
          <Link
            href="/recipes/new"
            className="bg-white text-terra rounded-full px-4 py-1.5 text-sm font-bold hover:bg-terra-light transition-colors"
          >
            ＋ 新しいレシピ
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
