import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Outloop | Enterprise Subscription Engine",
  description: "Enterprise Subscription Management & Recurring Billing Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-zinc-50/60 font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <Suspense fallback={<div className="h-14 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />}>
          <RoleProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <footer className="border-t border-zinc-200/80 bg-white py-4 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-500">
                <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span>Outloop Subscription Engine • Odoo × Make-A-Ton 9.0</span>
                  <span className="font-mono text-[11px]">Relational PostgreSQL • Supabase Verified</span>
                </div>
              </footer>
            </div>
          </RoleProvider>
        </Suspense>
      </body>
    </html>
  );
}
