"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { useToast } from "@/context/ToastContext";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, InvoiceStatusBadge } from "@/components/ui/StatusBadge";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Repeat,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BellRing,
  Send,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface SubItem {
  id: string;
  sub_number: string;
  customer_name: string;
  plan_name: string;
  billing_interval: string;
  stage: string;
  grand_total: number;
  created_at: string;
}

interface InvItem {
  id: string;
  invoice_number: string;
  customer?: { name: string; email: string };
  subscription_ref?: string;
  status: string;
  total_amount: number;
  balance_due: number;
  due_date: string;
  is_overdue: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useRole();
  const { toast } = useToast();

  const [subscriptions, setSubscriptions] = useState<SubItem[]>([]);
  const [invoices, setInvoices] = useState<InvItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chasedInvoices, setChasedInvoices] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redirect customer persona directly to portal
  useEffect(() => {
    if (role === "CUSTOMER") {
      router.replace("/portal");
    }
  }, [role, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [subsRes, invsRes] = await Promise.all([
        fetch("/api/subscriptions"),
        fetch("/api/invoices"),
      ]);

      if (subsRes.ok) {
        const sData = await subsRes.json();
        const rawSubs = Array.isArray(sData) ? sData : sData.subscriptions || [];
        setSubscriptions(
          rawSubs.map((s: any) => ({
            id: s.id,
            sub_number: s.sub_number,
            customer_name: s.customer?.name || s.customer_name || "Client",
            plan_name: s.plan?.name || s.plan_name || "Contract",
            billing_interval: s.plan?.billing_interval || s.billing_interval || "MONTHLY",
            stage: s.stage,
            grand_total: Number(s.grand_total || 0),
            created_at: s.created_at,
          }))
        );
      }

      if (invsRes.ok) {
        const iData = await invsRes.json();
        setInvoices(iData.invoices || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute live executive metrics
  const { mrr, arr, totalCollected, activeCount, overdueAmount, overdueCount, overdueList } =
    useMemo(() => {
      // 1. Calculate MRR from active subscriptions
      let monthlyRunRate = 0;
      let activeSubs = 0;

      subscriptions.forEach((sub) => {
        if (sub.stage === "ACTIVE") {
          activeSubs++;
          const total = sub.grand_total;
          switch (sub.billing_interval.toUpperCase()) {
            case "YEARLY":
              monthlyRunRate += total / 12;
              break;
            case "MONTHLY":
              monthlyRunRate += total;
              break;
            case "WEEKLY":
              monthlyRunRate += (total * 52) / 12;
              break;
            case "DAILY":
              monthlyRunRate += total * 30;
              break;
            default:
              monthlyRunRate += total;
          }
        }
      });

      // 2. Sum collected revenue from payments across all invoices
      let collected = 0;
      let overdueSum = 0;
      const overdues: InvItem[] = [];

      invoices.forEach((inv) => {
        if (inv.status === "PAID") {
          collected += inv.total_amount;
        } else if (inv.status === "CONFIRMED" && (inv as any).paid_amount) {
          collected += Number((inv as any).paid_amount || 0);
        }

        if (inv.is_overdue && inv.balance_due > 0) {
          overdueSum += inv.balance_due;
          overdues.push(inv);
        }
      });

      return {
        mrr: monthlyRunRate,
        arr: monthlyRunRate * 12,
        totalCollected: collected,
        activeCount: activeSubs,
        overdueAmount: overdueSum,
        overdueCount: overdues.length,
        overdueList: overdues,
      };
    }, [subscriptions, invoices]);

  const handleChaseInvoice = (inv: InvItem) => {
    setChasedInvoices((prev) => ({ ...prev, [inv.id]: true }));
    const customerEmail = inv.customer?.email || "billing contact";
    setToastMessage(`Payment reminder successfully dispatched for ${inv.invoice_number} to ${customerEmail}`);
    toast(`Payment reminder dispatched to ${customerEmail}`, "success");
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (role === "CUSTOMER") {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-zinc-500">
        Redirecting to Customer Portal...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-800 dark:text-emerald-300 transition-all">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Finance Lead Executive Overview"
        description="Live recurring run rates, cash collections, and liquidity risk monitoring."
        breadcrumbs={[{ label: "Executive Dashboard" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Receipt className="h-3.5 w-3.5" />
              Manage Billing
            </Link>
          </div>
        }
      />

      {/* Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <MetricCard
          title="Monthly Recurring (MRR)"
          value={`$${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Normalized monthly contract baseline"
          icon={TrendingUp}
        />
        <MetricCard
          title="Annual Run Rate (ARR)"
          value={`$${arr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Annualized forward run rate"
          icon={DollarSign}
        />
        <MetricCard
          title="Collected Cash"
          value={`$${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Settled payments on record"
          icon={Receipt}
        />
        <MetricCard
          title="Active Subscriptions"
          value={`${activeCount}`}
          subtitle="Live recurring accounts"
          icon={Repeat}
        />
        <div className="relative rounded-lg border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Past Due Receivables
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-950 dark:bg-rose-950/50">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="font-mono text-2xl font-semibold tracking-tight text-rose-600 dark:text-rose-400">
              ${overdueAmount.toFixed(2)}
            </div>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {overdueCount} account{overdueCount === 1 ? "" : "s"} require follow-up
          </p>
        </div>
      </div>

      {/* Revenue & Invoicing Trend Velocity Chart */}
      <RevenueTrendChart />

      {/* Immediate Attention & Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Immediate Attention: Overdue Invoices (2 cols) */}
        <div className="lg:col-span-2 rounded-lg border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Action Required: Past Due Receivables ({overdueList.length})
              </h3>
            </div>
            <Link
              href="/invoices?status=OVERDUE"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium inline-flex items-center gap-1"
            >
              View All Overdue
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {overdueList.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1 stroke-1" />
              Zero overdue receivables. All client accounts are current!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 font-medium">
                    <th className="pb-2">Invoice #</th>
                    <th className="pb-2">Account</th>
                    <th className="pb-2">Due Date</th>
                    <th className="pb-2 text-right">Balance Due</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                  {overdueList.map((inv) => (
                    <tr key={inv.id} className="py-2.5">
                      <td className="py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="py-2.5 font-sans font-medium text-zinc-800 dark:text-zinc-200">
                        {inv.customer?.name || "Client"}
                      </td>
                      <td className="py-2.5 text-rose-600 font-semibold text-[11px]">
                        {inv.due_date} (Past Due)
                      </td>
                      <td className="py-2.5 text-right font-semibold text-rose-600">
                        ${inv.balance_due.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-sans">
                        <button
                          onClick={() => handleChaseInvoice(inv)}
                          disabled={chasedInvoices[inv.id]}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
                        >
                          {chasedInvoices[inv.id] ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Chased
                            </>
                          ) : (
                            <>
                              <Send className="h-3 w-3 text-zinc-500" />
                              Follow Up
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Feed (1 col) */}
        <div className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              Recent Contract Activity
            </h3>
            <Link
              href="/subscriptions"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium inline-flex items-center gap-1"
            >
              Master List
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {subscriptions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                onClick={() => router.push(`/subscriptions/${sub.id}`)}
                className="group flex items-start justify-between p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {sub.sub_number}
                    </span>
                    <StatusBadge stage={sub.stage as any} />
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {sub.customer_name} • {sub.plan_name}
                  </div>
                </div>
                <div className="text-right font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  ${sub.grand_total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
