"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge, InvoiceStatusBadge } from "@/components/ui/StatusBadge";
import { PaymentModal } from "@/components/invoices/PaymentModal";
import {
  Building2,
  CreditCard,
  FileText,
  Calendar,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowUpRight,
  PackageCheck,
  DollarSign,
  Repeat,
  CheckCircle2,
} from "lucide-react";

interface SubSummary {
  id: string;
  sub_number: string;
  plan_name: string;
  billing_interval: string;
  stage: any;
  grand_total: number;
  start_date: string;
  expiry_date?: string | null;
  payment_terms: string;
  lines?: any[];
}

interface InvSummary {
  id: string;
  invoice_number: string;
  status: any;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  due_date: string;
  paid_at?: string | null;
  is_overdue: boolean;
  subscription_ref?: string;
}

export default function CustomerPortalPage() {
  const router = useRouter();
  const { persona, role } = useRole();

  const [subscriptions, setSubscriptions] = useState<SubSummary[]>([]);
  const [invoices, setInvoices] = useState<InvSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"SUBSCRIPTIONS" | "INVOICES">("SUBSCRIPTIONS");
  const [paymentTarget, setPaymentTarget] = useState<InvSummary | null>(null);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const [subsRes, invsRes] = await Promise.all([
        fetch("/api/subscriptions"),
        fetch(`/api/invoices?customer_id=${persona.id}`),
      ]);

      if (subsRes.ok) {
        const sData = await subsRes.json();
        const rawSubs = Array.isArray(sData) ? sData : sData.subscriptions || [];
        // filter subscriptions to active tenant
        const filtered = rawSubs.filter((s: any) => s.customer_id === persona.id);
        setSubscriptions(
          filtered.map((s: any) => ({
            id: s.id,
            sub_number: s.sub_number,
            plan_name: s.plan?.name || s.plan_name || "Contract",
            billing_interval: s.plan?.billing_interval || s.billing_interval || "MONTHLY",
            stage: s.stage,
            grand_total: Number(s.grand_total || 0),
            start_date: s.start_date,
            expiry_date: s.expiry_date,
            payment_terms: s.payment_terms || "Immediate Payment",
            lines: s.lines || [],
          }))
        );
      }

      if (invsRes.ok) {
        const iData = await invsRes.json();
        setInvoices(iData.invoices || []);
      }
    } catch (err) {
      console.error("Failed to load customer portal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [persona.id]);

  const activeSubsCount = subscriptions.filter((s) => s.stage === "ACTIVE").length;
  const outstandingInvoices = invoices.filter((i) => i.status === "CONFIRMED" && i.balance_due > 0);
  const totalBalanceDue = outstandingInvoices.reduce((acc, i) => acc + i.balance_due, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Customer Self-Service Portal"
        description="Review active enterprise contracts, renewal schedules, and settle outstanding invoices."
        breadcrumbs={[{ label: "Customer Portal" }]}
        actions={
          <button
            onClick={fetchPortalData}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {/* Account Info Profile Card */}
      <div className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-sm dark:bg-zinc-100 dark:text-zinc-900 font-mono">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {persona.company || "Acme Corp"}
                </h2>
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  Tier-1 Enterprise
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Primary Contact: {persona.name} ({persona.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Active Plans</span>
              <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {activeSubsCount}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Outstanding Due</span>
              <span className={`font-mono text-sm font-semibold ${totalBalanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                ${totalBalanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("SUBSCRIPTIONS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "SUBSCRIPTIONS"
              ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Repeat className="h-3.5 w-3.5" />
          <span>My Subscriptions</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">
            {subscriptions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("INVOICES")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "INVOICES"
              ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Invoices & Billing History</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">
            {invoices.length}
          </span>
        </button>
      </div>

      {/* Tab 1: My Subscriptions */}
      {activeTab === "SUBSCRIPTIONS" && (
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              No active subscription agreements found for this account.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {sub.sub_number}
                      </span>
                      <StatusBadge stage={sub.stage} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {sub.plan_name}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        Cadence: {sub.billing_interval} • Terms: {sub.payment_terms}
                      </p>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5 text-xs text-zinc-500 space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span>Effective Start:</span>
                        <span>{sub.start_date}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span>Renewal Date:</span>
                        <span>{sub.expiry_date || "Ongoing Automatic Renewal"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Contract Value</span>
                      <span className="font-mono font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        ${sub.grand_total.toFixed(2)}
                      </span>
                    </div>

                    <Link
                      href={`/subscriptions/${sub.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 px-2.5 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      View Agreement
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Invoices & Billing History */}
      {activeTab === "INVOICES" && (
        <div className="rounded-lg border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-medium">
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Agreement Ref</th>
                  <th className="py-2.5 px-4">Total Amount</th>
                  <th className="py-2.5 px-4">Balance Due</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      No invoices issued for this account yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className={inv.is_overdue ? "text-rose-600 font-semibold" : "text-zinc-600 dark:text-zinc-400"}>
                          {inv.due_date}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500">
                        {inv.subscription_ref || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        ${inv.total_amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {inv.balance_due === 0 ? (
                          <span className="text-emerald-600 font-mono">$0.00</span>
                        ) : (
                          <span className={inv.is_overdue ? "text-rose-600" : "text-zinc-900 dark:text-zinc-100"}>
                            ${inv.balance_due.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <InvoiceStatusBadge status={inv.status} isOverdue={inv.is_overdue} />
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {inv.status === "CONFIRMED" && inv.balance_due > 0 && (
                            <button
                              onClick={() => setPaymentTarget(inv)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 px-2 py-1 rounded transition-colors active:scale-[0.98]"
                            >
                              <CreditCard className="w-3 h-3" />
                              Pay Now
                            </button>
                          )}
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                          >
                            PDF
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Registration Modal */}
      {paymentTarget && (
        <PaymentModal
          isOpen={Boolean(paymentTarget)}
          invoiceId={paymentTarget.id}
          invoiceNumber={paymentTarget.invoice_number}
          totalAmount={paymentTarget.total_amount}
          balanceDue={paymentTarget.balance_due}
          onClose={() => setPaymentTarget(null)}
          onPaymentSuccess={() => {
            fetchPortalData();
          }}
        />
      )}
    </div>
  );
}
