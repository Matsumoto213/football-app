import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football App",
  description: "推しチーム・推し選手のスタッツ閲覧アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <header className="border-b border-stone-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
            <Link href="/" className="text-green-700 font-bold text-lg tracking-tight hover:text-green-600 transition-colors">
              Football App
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
