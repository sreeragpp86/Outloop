"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, InvoiceStatusBadge } from "@/components/ui/StatusBadge";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Repeat,
  ArrowUpRight,
  Plus,
  Play,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { role, persona } = useRole();

  // Redirect customer persona directly to portal
  useEffect(() => {
    if (role === "CUSTOMER") {
      router.replace("/portal");
    }
  }, [role, router]);

  if (role === "CUSTOMER") {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        Redirecting to Customer Portal...
      </div>
    );
  }

  // Summary figures from verified database seed
  const recentSubscriptions = [
    {
      sub_number: "SUB-2026-001",
      customer: "Acme Corp / Liam Patel",
      plan: "Growth Yearly",
      stage: "ACTIVE" as const,
      grand_total: 1497.42,
      start_date: "2026-01-01",
    },
    {
      sub_number: "SUB-2026-003",
      customer: "Acme Corp / Liam Patel",
      plan: "Enterprise Scale",
      stage: "CONFIRMED" as const,
      grand_total: 2737.60,
      start_date: "2026-11-01",
    },
    {
      sub_number: "SUB-2026-004",
      customer: "Acme Corp / Liam Patel",
      plan: "Starter Monthly",
      stage: "QUOTATION" as const,
      grand_total: 241.90,
      start_date: "2026-11-01",
    },
    {
      sub_number: "SUB-2026-002",
      customer: "Acme Corp / Liam Patel",
      plan: "Starter Monthly",
      stage: "PAUSED" as const,
      grand_total: 200.60,
      start_date: "2026-02-01",
    },
  ];

  const recentInvoices = [
    {
      invoice_number: "INV-2026-003",
      customer: "Acme Corp",
      status: "CONFIRMED" as const,
      isOverdue: true,
      amount: 200.60,
      due_date: "2026-10-15",
    },
    {
      invoice_number: "INV-2026-004",
      customer: "Acme Corp",
      status: "CONFIRMED" as const,
      isOverdue: false,
      amount: 2737.60,
      due_date: "2026-11-15",
    },
    {
      invoice_number: "INV-2026-001",
      customer: "Acme Corp",
      status: "PAID" as const,
      isOverdue: false,
      amount: 1497.42,
      due_date: "2026-01-15",
    },
    {
      invoice_number: "INV-2026-005",
      customer: "Acme Corp",
      status: "DRAFT" as const,
      isOverdue: false,
      amount: 241.90,
      due_date: "2026-11-30",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Operations Dashboard"
        description="Subscription lifecycle telemetry, automated recurring receivables, and contract metrics."
        badge={
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-mono font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {persona.name} ({role})
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Play className="h-3 w-3 text-zinc-500" />
              Run Billing Day
            </Link>
            <Link
              href="/subscriptions"
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-3.5 w-3.5" />
              New Subscription
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value="$1,410.00"
          change="+18.4%"
          changeType="positive"
          subtitle="Normalized active run rate"
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Contract Value"
          value="$5,686.42"
          change="6 contracts"
          changeType="neutral"
          subtitle="Active, confirmed & paused"
          icon={DollarSign}
        />
        <MetricCard
          title="Outstanding Receivables"
          value="$2,938.20"
          change="1 overdue ($200.60)"
          changeType="negative"
          subtitle="2 confirmed invoices unpaid"
          icon={Receipt}
        />
        <MetricCard
          title="Active Subscriptions"
          value="1"
          change="1 paused • 1 confirmed"
          changeType="neutral"
          subtitle="Contract churn: 0.0%"
          icon={Repeat}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Subscriptions */}
        <div className="rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Recent Subscriptions
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Active recurring agreements and pending quotes
              </p>
            </div>
            <Link
              href="/subscriptions"
              className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {recentSubscriptions.map((sub) => (
              <div
                key={sub.sub_number}
                className="flex items-center justify-between p-3.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {sub.sub_number}
                    </span>
                    <StatusBadge stage={sub.stage} />
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {sub.customer} • {sub.plan}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    ${sub.grand_total.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Starts {sub.start_date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices & Receivables */}
        <div className="rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Invoices & Receivables
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Billing schedule status and payments
              </p>
            </div>
            <Link
              href="/invoices"
              className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {recentInvoices.map((inv) => (
              <div
                key={inv.invoice_number}
                className="flex items-center justify-between p-3.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {inv.invoice_number}
                    </span>
                    <InvoiceStatusBadge
                      status={inv.status}
                      isOverdue={inv.isOverdue}
                    />
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {inv.customer}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    ${inv.amount.toFixed(2)}
                  </div>
                  <div className={`text-[11px] ${inv.isOverdue ? "text-amber-600 dark:text-amber-400 font-medium" : "text-zinc-400"}`}>
                    Due {inv.due_date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
