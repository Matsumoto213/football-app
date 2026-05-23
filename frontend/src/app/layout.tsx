import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football App",
  description: "推しチーム・推し選手のスタッツ閲覧アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-zinc-900 text-zinc-50">
        <header className="border-b border-zinc-700/60 bg-zinc-800">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
            <Link
              href="/"
              className="text-emerald-400 font-bold text-lg tracking-tight hover:text-emerald-300"
            >
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
