"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcome = pathname === "/welcome";

  if (isWelcome) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 print:p-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-none">
          {children}
        </div>
      </main>
      <footer className="border-t border-zinc-200/80 bg-white py-4 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-500 print:hidden">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Outloop Subscription Engine • Brightloop Software Inc.</span>
          <span className="font-mono text-[11px]">Relational PostgreSQL • Supabase Verified</span>
        </div>
      </footer>
    </div>
  );
}
