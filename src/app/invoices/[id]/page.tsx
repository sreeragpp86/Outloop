"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Loader2,
  Building,
  Calendar,
  FileText,
  DollarSign,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { InvoiceStatusBadge } from "@/components/ui/StatusBadge";
import { PaymentModal } from "@/components/invoices/PaymentModal";

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  subscription_id: string | null;
  customer_id: string;
  status: "DRAFT" | "CONFIRMED" | "PAID" | "CANCELLED";
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  due_date: string;
  paid_at: string | null;
  created_at: string;
  is_overdue: boolean;
  customer?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  subscription?: {
    id: string;
    sub_number: string;
    stage: string;
    start_date: string;
    expiry_date?: string | null;
    payment_terms: string;
    plan?: {
      name: string;
      billing_interval: string;
    };
    discount?: {
      code: string;
      value: number;
      discount_type: string;
    };
    lines?: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      tax_amount: number;
      line_total: number;
      product?: {
        name: string;
        tax_rate: number;
      };
      variant?: {
        variant_name: string;
        extra_price: number;
      };
    }>;
  };
  payments?: Array<{
    id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    notes?: string | null;
    created_at: string;
  }>;
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useRole();

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new Error("Invoice record not found");
      const data = await res.json();
      setInvoice(data);
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Failed to load invoice" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleStatusTransition = async (newStatus: "CONFIRMED" | "CANCELLED") => {
    try {
      setActionLoading(true);
      setFeedback(null);

      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to transition invoice status");

      setFeedback({
        type: "success",
        msg: `Invoice marked as ${newStatus.toLowerCase()}.`,
      });
      fetchInvoice();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Failed to update invoice" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading invoice details...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Invoice not found
        </h2>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Invoices
        </Link>
      </div>
    );
  }

  const subLines = invoice.subscription?.lines || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Action Bar (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
          <span className="text-xs text-zinc-400 font-mono">/</span>
          <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {invoice.invoice_number}
          </span>
          <InvoiceStatusBadge status={invoice.status} isOverdue={invoice.is_overdue} />
        </div>

        <div className="flex items-center gap-2">
          {/* Action: Print / PDF */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / PDF
          </button>

          {/* Action: Confirm (from Draft) */}
          {invoice.status === "DRAFT" && role !== "CUSTOMER" && (
            <button
              onClick={() => handleStatusTransition("CONFIRMED")}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirm Invoice
            </button>
          )}

          {/* Action: Register Payment (from Confirmed if balance > 0) */}
          {invoice.status === "CONFIRMED" && invoice.balance_due > 0 && role !== "CUSTOMER" && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98]"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Register Payment
            </button>
          )}

          {/* Action: Cancel Invoice (if not paid) */}
          {["DRAFT", "CONFIRMED"].includes(invoice.status) && role !== "CUSTOMER" && (
            <button
              onClick={() => handleStatusTransition("CANCELLED")}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 shadow-xs hover:bg-rose-50 active:scale-[0.98] disabled:opacity-50 dark:border-rose-900/60 dark:bg-zinc-900 dark:text-rose-400"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Invoice
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`print:hidden rounded-md p-3 text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Printable Invoice Paper Container */}
      <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs dark:bg-zinc-100 dark:text-zinc-900 font-mono">
                BL
              </div>
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Brightloop Software
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Enterprise Subscription & Recurring Billing Infrastructure
            </p>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              VAT / Tax ID: US-BL-98231019
            </p>
          </div>

          <div className="text-left sm:text-right">
            <h1 className="text-xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
              {invoice.invoice_number}
            </h1>
            <div className="mt-1 flex sm:justify-end">
              <InvoiceStatusBadge status={invoice.status} isOverdue={invoice.is_overdue} />
            </div>
            <p className="mt-2 text-xs text-zinc-500 font-mono">
              Issue Date: {invoice.created_at?.slice(0, 10)}
            </p>
            <p
              className={`text-xs font-mono font-medium ${
                invoice.is_overdue ? "text-rose-600 font-semibold" : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Due Date: {invoice.due_date}
            </p>
          </div>
        </div>

        {/* Bill-To & Contract Terms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Billed To
            </span>
            <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100 text-sm">
              {invoice.customer?.name || "Customer Account"}
            </div>
            <div className="text-zinc-500 font-mono text-xs mt-0.5">
              {invoice.customer?.email}
            </div>
            <div className="text-zinc-400 text-[11px] mt-1">
              Account ID: {invoice.customer_id.slice(0, 13)}...
            </div>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Agreement Reference
            </span>
            {invoice.subscription ? (
              <div>
                <Link
                  href={`/subscriptions/${invoice.subscription_id}`}
                  className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  {invoice.subscription.sub_number}
                </Link>
                <div className="text-zinc-500 text-[11px] mt-0.5">
                  Plan: {invoice.subscription.plan?.name} ({invoice.subscription.plan?.billing_interval})
                </div>
                <div className="text-zinc-400 text-[11px] font-mono">
                  Terms: {invoice.subscription.payment_terms}
                </div>
              </div>
            ) : (
              <div className="text-zinc-500">Standalone Invoice</div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider font-medium">
                <th className="pb-2">Description / Product</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Unit Price</th>
                <th className="pb-2 text-right">Tax (18%)</th>
                <th className="pb-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
              {subLines.length > 0 ? (
                subLines.map((line) => (
                  <tr key={line.id} className="py-2.5">
                    <td className="py-2.5 pr-2 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                      <div>{line.product?.name || "Service Item"}</div>
                      {line.variant && (
                        <div className="text-[11px] text-zinc-500 font-sans font-normal">
                          {line.variant.variant_name} (+${Number(line.variant.extra_price).toFixed(2)})
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-center text-zinc-700 dark:text-zinc-300">
                      {line.quantity}
                    </td>
                    <td className="py-2.5 text-right text-zinc-700 dark:text-zinc-300">
                      ${Number(line.unit_price).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right text-zinc-500">
                      ${Number(line.tax_amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                      ${Number(line.line_total).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2.5 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                    Recurring Subscription Service
                  </td>
                  <td className="py-2.5 text-center text-zinc-700 dark:text-zinc-300">1</td>
                  <td className="py-2.5 text-right text-zinc-700 dark:text-zinc-300">
                    ${invoice.subtotal.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right text-zinc-500">
                    ${invoice.tax_amount.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    ${invoice.subtotal.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <div className="text-xs text-zinc-500 max-w-xs space-y-1">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Payment Instructions</span>
            <p className="text-[11px] text-zinc-400">
              Remit settlement via ACH Wire to JPMorgan Chase NA, Acct #881920-BL, Routing #021000021.
              Please reference invoice number on payment documentation.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                ${invoice.subtotal.toFixed(2)}
              </span>
            </div>

            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied:</span>
                <span className="font-mono tabular-nums">
                  -${invoice.discount_amount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-zinc-500">
              <span>Tax (18%):</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                ${invoice.tax_amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2 font-semibold text-zinc-900 dark:text-zinc-50 text-sm">
              <span>Grand Total:</span>
              <span className="font-mono tabular-nums">
                ${invoice.total_amount.toFixed(2)}
              </span>
            </div>

            {invoice.paid_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Total Paid:</span>
                <span className="font-mono tabular-nums">
                  -${invoice.paid_amount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2 font-bold text-sm">
              <span>Balance Due:</span>
              <span
                className={`font-mono tabular-nums ${
                  invoice.balance_due === 0
                    ? "text-emerald-600"
                    : invoice.is_overdue
                    ? "text-rose-600"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                ${invoice.balance_due.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Linked Payments History Section */}
        <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Settlement & Payment Records ({(invoice.payments || []).length})
            </h3>
            {invoice.status === "CONFIRMED" && invoice.balance_due > 0 && role !== "CUSTOMER" && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="print:hidden inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                <CreditCard className="w-3 h-3" />
                Add Settlement
              </button>
            )}
          </div>

          {(invoice.payments || []).length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-200 dark:border-zinc-800 p-4 text-center text-xs text-zinc-400">
              No payments recorded against this invoice yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 font-medium">
                    <th className="py-2">Payment Date</th>
                    <th className="py-2">Method</th>
                    <th className="py-2">Reference / Notes</th>
                    <th className="py-2 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                  {(invoice.payments || []).map((pay) => (
                    <tr key={pay.id} className="py-2">
                      <td className="py-2 text-zinc-600 dark:text-zinc-400">
                        {pay.payment_date}
                      </td>
                      <td className="py-2 font-sans font-medium text-zinc-800 dark:text-zinc-200">
                        {pay.payment_method}
                      </td>
                      <td className="py-2 font-sans text-zinc-500">
                        {pay.notes || "—"}
                      </td>
                      <td className="py-2 text-right font-medium text-emerald-600">
                        ${Number(pay.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoice_number}
          totalAmount={invoice.total_amount}
          balanceDue={invoice.balance_due}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={() => {
            fetchInvoice();
          }}
        />
      )}
    </div>
  );
}
