"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  ArrowRight,
  ShieldCheck,
  Repeat,
  Zap,
  CreditCard,
  Users,
  CheckCircle2,
  DollarSign,
  Receipt,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Check,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { setRole } = useRole();

  const handleLaunchAdminDemo = () => {
    setRole("ADMIN");
    router.push("/");
  };

  const handleLaunchCustomerDemo = () => {
    setRole("CUSTOMER");
    router.push("/portal");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/welcome" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-zinc-950 shadow-xs">
                OL
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">
                Outloop
              </span>
            </Link>
            <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              Brightloop Edition
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs text-zinc-400">
            <a href="#capabilities" className="hover:text-zinc-100 transition-colors">
              Capabilities
            </a>
            <a href="#architecture" className="hover:text-zinc-100 transition-colors">
              Architecture
            </a>
            <a href="#preview" className="hover:text-zinc-100 transition-colors">
              Live Preview
            </a>
            <a href="#workflow" className="hover:text-zinc-100 transition-colors">
              Workflow
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-300 hover:text-white px-2.5 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 shadow-xs hover:bg-zinc-200 active:scale-[0.98] transition-all"
            >
              Get Started
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-zinc-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400 font-mono mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Outloop Engine v9.0 • Enterprise Recurring Billing</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Unified Subscription Lifecycle & Automated Recurring Billing
            </h1>

            {/* Direct Subtext */}
            <p className="mt-5 text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-2xl">
              From quotation templates and dynamic variant pricing to automated billing day runs and payment reconciliation.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={handleLaunchAdminDemo}
                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-sm hover:bg-zinc-200 active:scale-[0.98] transition-all"
              >
                <span>Explore Live Demo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 active:scale-[0.98] transition-all"
              >
                Create Customer Account
              </Link>

              <button
                onClick={handleLaunchCustomerDemo}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <Users className="h-3.5 w-3.5 opacity-70" />
                <span>Customer Portal</span>
              </button>
            </div>

            {/* Key Architectural Guarantees */}
            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Deterministic Recurring Math</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Idempotent Batch Billing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Role-Enforced RBAC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Architecture & Capability Grid (4 Cards) */}
      <section id="capabilities" className="py-20 border-b border-zinc-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                Core Relational Architecture
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Engineered for High-Frequency B2B Contracts
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-md">
              Replacing fragmented billing scripts with relational database integrity, strict state machine pipelines, and zero invoice drift.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Subscription Studio */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700/60">
                    <Repeat className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 uppercase tracking-wider">
                    Pipeline Engine
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Subscription Studio
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Multi-cycle plans (Daily, Weekly, Monthly, Yearly) with dynamic variant price deltas (+$560 Enterprise Edition). Real-time line item calculations react immediately to quantity thresholds and discount structures.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Finite State Machine</span>
                <span className="text-zinc-300">Draft → Confirmed → Active</span>
              </div>
            </div>

            {/* Card 2: Automated Billing Day */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700/60">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 uppercase tracking-wider">
                    Batch Engine
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Automated Billing Day
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Idempotent batch invoice generator that calculates taxes (18%) and active discounts with zero double-billing. Deterministic renewal intervals and automated invoice sequencing (<span className="font-mono text-zinc-300">INV-2026-XXXX</span>).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Execution Guarantee</span>
                <span className="text-emerald-400">Zero Duplicate Billing</span>
              </div>
            </div>

            {/* Card 3: Payment Reconciliation */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700/60">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 uppercase tracking-wider">
                    Ledger Sync
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Payment Reconciliation
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Multi-rail payment logging (Bank Transfer, Card, UPI) with real-time balance reconciliation, automated paid status transitions, and itemized settlement audit trails.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Settlement Rails</span>
                <span className="text-zinc-300">Wire • Card • Direct Debit</span>
              </div>
            </div>

            {/* Card 4: Granular RBAC */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700/60">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 uppercase tracking-wider">
                    Role Enforcement
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Granular RBAC & Customer Portal
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Dedicated workflows for Admin (full catalog control & staff provisioning), Staff (quotations & billing operations), and self-service Customer Portals with PDF invoice rendering.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Access Personas</span>
                <span className="text-zinc-300">Admin • Staff • Customer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Snapshot Section */}
      <section id="preview" className="py-20 border-b border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Live Interface Snapshot
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Tactile Finance Executive Operations
            </h2>
            <p className="mt-2 text-xs text-zinc-400">
              Live aggregate metrics, past-due chase workflows, and instant invoice PDF generation.
            </p>
          </div>

          {/* Browser Window Mock Frame */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              </div>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <span>https://outloop.brightloop.io</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-300">finance-executive</span>
              </div>
              <div className="w-10" />
            </div>

            {/* Window Content Mock */}
            <div className="p-6 space-y-6">
              {/* Snapshot Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Monthly Recurring Revenue
                  </span>
                  <div className="font-mono text-xl font-bold text-white mt-1">
                    $1,885.00
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">+14.2% MoM</span>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Annual Run Rate (ARR)
                  </span>
                  <div className="font-mono text-xl font-bold text-white mt-1">
                    $22,620.00
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Normalized cadence</span>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Active Subscriptions
                  </span>
                  <div className="font-mono text-xl font-bold text-white mt-1">
                    2 Accounts
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">100% retention</span>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Past Due Receivables
                  </span>
                  <div className="font-mono text-xl font-bold text-rose-400 mt-1">
                    $218.30
                  </div>
                  <span className="text-[10px] text-rose-400 font-mono">1 account overdue</span>
                </div>
              </div>

              {/* Sample Data Row Preview */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-white">INV-2026-005</span>
                    <span className="text-zinc-400">Acme Corp / Liam Patel</span>
                    <span className="text-zinc-500 text-[11px]">Brightloop Core Cloud + Enterprise Edition</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">$241.90</span>
                    <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 uppercase">
                      PAID IN FULL
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span className="text-[11px] font-mono">O(1) Stage Pipeline: Draft → Quotation → Confirmed → Active</span>
                  <button
                    onClick={handleLaunchAdminDemo}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:underline"
                  >
                    Launch Live Application
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimal Enterprise Footer */}
      <footer className="py-12 border-t border-zinc-900 bg-zinc-950 text-xs text-zinc-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-[10px] font-bold text-zinc-950">
              OL
            </div>
            <span className="font-semibold text-zinc-300">Brightloop Software Inc.</span>
            <span className="font-mono text-[11px] text-zinc-600">• Outloop Engine</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-zinc-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              Sign Up
            </Link>
            <Link href="/portal" className="hover:text-white transition-colors">
              Customer Portal
            </Link>
            <button
              onClick={handleLaunchAdminDemo}
              className="hover:text-white transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-6 pt-6 border-t border-zinc-900 text-center sm:text-left text-[11px] text-zinc-600 font-mono">
          © 2026 Brightloop Software Inc. All rights reserved. Enterprise Recurring Billing & Quotation Infrastructure.
        </div>
      </footer>
    </div>
  );
}
