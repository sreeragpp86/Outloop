"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge, InvoiceStatusBadge } from "@/components/ui/StatusBadge";
import {
  Building2,
  CreditCard,
  FileText,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function CustomerPortalPage() {
  const { persona, role, setRole } = useRole();

  const customerSubscriptions = [
    {
      sub_number: "SUB-2026-001",
      plan: "Growth Yearly",
      stage: "ACTIVE" as const,
      grand_total: 1497.42,
      start_date: "2026-01-01",
      expiry_date: "2026-12-31",
      items: [
        "5x Brightloop Core Cloud ($600.00)",
        "1x Enterprise ERP Connector [Odoo] ($810.00)",
      ],
      discount: "10% Bulk Discount Applied (-$141.00)",
    },
    {
      sub_number: "SUB-2026-002",
      plan: "Starter Monthly",
      stage: "PAUSED" as const,
      grand_total: 200.6,
      start_date: "2026-02-01",
      expiry_date: "2026-08-01",
      items: ["2x Field Operations Module ($170.00)"],
      discount: null,
    },
  ];

  const customerInvoices = [
    {
      invoice_number: "INV-2026-003",
      amount: 200.6,
      due_date: "2026-10-15",
      status: "CONFIRMED" as const,
      isOverdue: true,
      description: "Starter Monthly (Field Ops)",
    },
    {
      invoice_number: "INV-2026-004",
      amount: 2737.6,
      due_date: "2026-11-15",
      status: "CONFIRMED" as const,
      isOverdue: false,
      description: "Enterprise Scale Advance",
    },
    {
      invoice_number: "INV-2026-001",
      amount: 1497.42,
      due_date: "2026-01-15",
      status: "PAID" as const,
      isOverdue: false,
      description: "Growth Yearly Annual Settlement (Card ••4242)",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Acme Corp Account Portal"
        description="Self-service subscription management, contract terms, and automated invoice settlements."
        breadcrumbs={[
          { label: "Account Portal" },
        ]}
        badge={
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
            Client Self-Service
          </span>
        }
        actions={
          role !== "CUSTOMER" ? (
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              Switch to Customer Role
            </button>
          ) : null
        }
      />

      {/* Account Info Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-zinc-200/90 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm">
            AC
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Acme Corporation
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Primary Contact: Liam Patel (liam@acme.com) • Account ID: AC-9821
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-xs font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Verified B2B Client
          </span>
        </div>
      </div>

      {/* Portal Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Active Contracts"
          value="1 Active"
          change="1 Paused"
          changeType="neutral"
          subtitle="Brightloop Core & Odoo ERP"
          icon={Calendar}
        />
        <MetricCard
          title="Outstanding Balance"
          value="$2,938.20"
          change="1 overdue ($200.60)"
          changeType="negative"
          subtitle="2 open invoices"
          icon={CreditCard}
        />
        <MetricCard
          title="Lifetime Settled"
          value="$2,205.42"
          change="2 paid invoices"
          changeType="positive"
          subtitle="No payment failures"
          icon={FileText}
        />
      </div>

      {/* Subscriptions & Invoices Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Acme's Subscriptions */}
        <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Your Subscriptions
          </h2>

          <div className="space-y-3">
            {customerSubscriptions.map((sub) => (
              <div
                key={sub.sub_number}
                className="rounded-md border border-zinc-100 p-3.5 dark:border-zinc-800 hover:border-zinc-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {sub.sub_number}
                    </span>
                    <StatusBadge stage={sub.stage} />
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    ${sub.grand_total.toFixed(2)}
                  </span>
                </div>

                <div className="mt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Plan: {sub.plan}
                </div>

                <ul className="mt-1 space-y-0.5 text-[11px] text-zinc-500">
                  {sub.items.map((it, idx) => (
                    <li key={idx}>• {it}</li>
                  ))}
                  {sub.discount && (
                    <li className="text-emerald-600 dark:text-emerald-400 font-medium">
                      • {sub.discount}
                    </li>
                  )}
                </ul>

                <div className="mt-2 text-[11px] font-mono text-zinc-400">
                  Period: {sub.start_date} to {sub.expiry_date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acme's Invoices */}
        <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Invoices & Statements
          </h2>

          <div className="space-y-3">
            {customerInvoices.map((inv) => (
              <div
                key={inv.invoice_number}
                className="flex items-center justify-between rounded-md border border-zinc-100 p-3.5 dark:border-zinc-800 hover:border-zinc-200 transition-colors"
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
                  <div className="text-xs text-zinc-500">
                    {inv.description}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    Due: {inv.due_date}
                  </div>
                </div>

                <div className="text-right space-y-1.5">
                  <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    ${inv.amount.toFixed(2)}
                  </div>
                  {inv.status !== "PAID" && (
                    <button
                      type="button"
                      className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
