import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "たくみんレシピ",
  description: "自炊レシピ記録帳",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <div className="app" data-header="light">
          <header className="topbar">
            <Link href="/" className="brand">
              <span className="brand__mark" aria-hidden="true" />
              <span className="brand__name">たくみんレシピ</span>
            </Link>
            <Link href="/recipes/new" className="newbtn">
              ＋ 新しいレシピ
            </Link>
          </header>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
