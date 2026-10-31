"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { InvoiceStatusBadge } from "@/components/ui/StatusBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { Play, CheckCircle2, Clock, AlertTriangle, Search, Filter } from "lucide-react";
import { InvoiceStatus } from "@/types/database";

interface InvoiceItem {
  id: string;
  invoice_number: string;
  subscription_ref: string;
  customer: string;
  status: InvoiceStatus;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  paid_at: string | null;
  payment_method?: string;
  isOverdue?: boolean;
}

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);

  const invoices: InvoiceItem[] = [
    {
      id: "f0000000-0000-4000-8000-000000000001",
      invoice_number: "INV-2026-001",
      subscription_ref: "SUB-2026-001",
      customer: "Acme Corp / Liam Patel",
      status: "PAID",
      subtotal: 1410.0,
      discount_amount: 141.0,
      tax_amount: 228.42,
      total_amount: 1497.42,
      due_date: "2026-01-15",
      paid_at: "2026-01-14",
      payment_method: "Credit Card (Visa ••4242)",
    },
    {
      id: "f0000000-0000-4000-8000-000000000002",
      invoice_number: "INV-2026-002",
      subscription_ref: "SUB-2026-006",
      customer: "Acme Corp / Liam Patel",
      status: "PAID",
      subtotal: 600.0,
      discount_amount: 0.0,
      tax_amount: 108.0,
      total_amount: 708.0,
      due_date: "2025-10-01",
      paid_at: "2025-09-30",
      payment_method: "Bank Transfer (ACH)",
    },
    {
      id: "f0000000-0000-4000-8000-000000000003",
      invoice_number: "INV-2026-003",
      subscription_ref: "SUB-2026-002",
      customer: "Acme Corp / Liam Patel",
      status: "CONFIRMED",
      subtotal: 170.0,
      discount_amount: 0.0,
      tax_amount: 30.6,
      total_amount: 200.6,
      due_date: "2026-10-15",
      paid_at: null,
      isOverdue: true,
    },
    {
      id: "f0000000-0000-4000-8000-000000000004",
      invoice_number: "INV-2026-004",
      subscription_ref: "SUB-2026-003",
      customer: "Acme Corp / Liam Patel",
      status: "CONFIRMED",
      subtotal: 2820.0,
      discount_amount: 500.0,
      tax_amount: 417.6,
      total_amount: 2737.6,
      due_date: "2026-11-15",
      paid_at: null,
      isOverdue: false,
    },
    {
      id: "f0000000-0000-4000-8000-000000000005",
      invoice_number: "INV-2026-005",
      subscription_ref: "SUB-2026-004",
      customer: "Acme Corp / Liam Patel",
      status: "DRAFT",
      subtotal: 205.0,
      discount_amount: 0.0,
      tax_amount: 36.9,
      total_amount: 241.9,
      due_date: "2026-11-30",
      paid_at: null,
      isOverdue: false,
    },
  ];

  const handleRunBilling = () => {
    setBillingRunning(true);
    setTimeout(() => {
      setBillingRunning(false);
      setBillingMessage("Billing run complete: 0 new recurring invoices generated (all active schedules up to date).");
      setTimeout(() => setBillingMessage(null), 5000);
    }, 700);
  };

  const filtered = invoices.filter((inv) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "OVERDUE") return inv.isOverdue;
    return inv.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Recurring Billing"
        description="Automated invoice generation, payment capture, and accounts receivable reconciliation."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Invoices & Billing" },
        ]}
        actions={
          <button
            type="button"
            onClick={handleRunBilling}
            disabled={billingRunning}
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Play className={`h-3 w-3 ${billingRunning ? "animate-spin" : ""}`} />
            {billingRunning ? "Running Billing..." : "Run Billing Day"}
          </button>
        }
      />

      {billingMessage && (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          {billingMessage}
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Collected Receivables"
          value="$2,205.42"
          change="2 paid invoices"
          changeType="positive"
          subtitle="Settled via CC & Bank Wire"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Open Confirmed"
          value="$2,938.20"
          change="2 open invoices"
          changeType="neutral"
          subtitle="Upcoming & past due"
          icon={Clock}
        />
        <MetricCard
          title="Past Due / Overdue"
          value="$200.60"
          change="INV-2026-003"
          changeType="negative"
          subtitle="Due October 15, 2026"
          icon={AlertTriangle}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
        {["ALL", "CONFIRMED", "PAID", "OVERDUE", "DRAFT"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors active:scale-[0.98] ${
              statusFilter === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200/70 bg-zinc-50/75 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Contract Ref</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Tax (18%)</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3">Payment Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-zinc-50/70 transition-colors dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    {inv.invoice_number}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-500">
                    {inv.subscription_ref}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {inv.customer}
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge
                      status={inv.status}
                      isOverdue={inv.isOverdue}
                    />
                  </td>
                  <td
                    className={`px-4 py-3 font-mono text-[11px] ${
                      inv.isOverdue
                        ? "text-amber-600 dark:text-amber-400 font-semibold"
                        : "text-zinc-500"
                    }`}
                  >
                    {inv.due_date}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                    ${inv.tax_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    ${inv.total_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-zinc-500">
                    {inv.payment_method ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        {inv.payment_method}
                      </span>
                    ) : inv.isOverdue ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Awaiting Payment (Past Due)
                      </span>
                    ) : (
                      <span className="text-zinc-400">Unpaid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
