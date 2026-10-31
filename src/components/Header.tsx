"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  Package,
  Users,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { role } = useRole();

  const navItems = [
    {
      label: role === "CUSTOMER" ? "Overview" : "Dashboard",
      href: role === "CUSTOMER" ? "/portal" : "/",
      icon: LayoutDashboard,
      roles: ["ADMIN", "STAFF", "CUSTOMER"],
    },
    {
      label: role === "CUSTOMER" ? "My Subscriptions" : "Subscriptions",
      href: "/subscriptions",
      icon: Repeat,
      roles: ["ADMIN", "STAFF", "CUSTOMER"],
    },
    {
      label: role === "CUSTOMER" ? "My Invoices" : "Invoices & Billing",
      href: "/invoices",
      icon: Receipt,
      roles: ["ADMIN", "STAFF", "CUSTOMER"],
    },
    {
      label: "Products & Plans",
      href: "/products",
      icon: Package,
      roles: ["ADMIN"],
    },
    {
      label: "Staff Directory",
      href: "/settings/staff",
      icon: Users,
      roles: ["ADMIN"],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 print:hidden">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href={role === "CUSTOMER" ? "/portal" : "/"} className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm">
              OL
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Outloop
              </span>
              <span className="hidden sm:inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Enterprise
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 opacity-70" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {role === "STAFF" && (
            <span className="hidden lg:inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800">
              Admin Restricted
            </span>
          )}

          {role === "CUSTOMER" && (
            <span className="hidden lg:inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Customer Portal Mode
            </span>
          )}

          <PersonaSwitcher />
        </div>
      </div>
    </header>
  );
}
