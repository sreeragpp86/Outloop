import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { ToastProvider } from "@/context/ToastContext";
import { AppShell } from "@/components/AppShell";

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
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </RoleProvider>
        </Suspense>
      </body>
    </html>
  );
}
