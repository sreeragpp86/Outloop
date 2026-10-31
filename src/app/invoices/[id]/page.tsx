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
    <div className="space-y-6 max-w-4xl mx-auto pb-12 print:p-0 print:m-0 print:max-w-none print:space-y-4">
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
          {/* Action: Print / Save PDF */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
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
      <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 print:border-none print:shadow-none print:p-0 print:bg-white print:text-zinc-950">
        {/* Letterhead & Metadata */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs dark:bg-zinc-100 dark:text-zinc-900 font-mono print:bg-zinc-900 print:text-white">
                BL
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight print:text-black">
                  Brightloop Software Inc.
                </h2>
                <p className="text-[11px] text-zinc-500 print:text-zinc-600">
                  Enterprise Subscription & Recurring Billing Infrastructure
                </p>
              </div>
            </div>
            <div className="mt-2.5 space-y-0.5 text-[11px] text-zinc-500 font-mono print:text-zinc-600">
              <p>Registration: #BL-849204 • Tax / VAT ID: US-BL-98231019</p>
              <p>100 Montgomery St, Suite 1800, San Francisco, CA 94104</p>
              <p>billing@brightloop.io • support@brightloop.io</p>
            </div>
          </div>

          <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 print:text-zinc-500">
              Official Tax Invoice
            </span>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 print:text-black">
              {invoice.invoice_number}
            </h1>

            {/* Payment Status Stamp Watermark */}
            <div className="mt-2">
              {invoice.status === "PAID" ? (
                <div className="inline-flex items-center gap-1.5 rounded border-2 border-emerald-600 bg-emerald-50 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-xs rotate-[-2deg] print:border-emerald-700 print:text-emerald-800 print:bg-emerald-50/50">
                  <CheckCircle2 className="h-4 w-4" />
                  PAID IN FULL
                </div>
              ) : invoice.status === "CONFIRMED" ? (
                <div className="inline-flex items-center gap-1.5 rounded border border-amber-500 bg-amber-50 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-amber-700 print:border-amber-600 print:text-amber-800 print:bg-transparent">
                  <Clock className="h-3.5 w-3.5" />
                  CONFIRMED • DUE
                </div>
              ) : invoice.status === "CANCELLED" ? (
                <div className="inline-flex items-center gap-1.5 rounded border-2 border-rose-600 bg-rose-50 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-rose-700 rotate-[-2deg] print:border-rose-700 print:text-rose-800 print:bg-transparent">
                  <XCircle className="h-4 w-4" />
                  CANCELLED / VOID
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded border border-zinc-400 bg-zinc-50 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600 print:border-zinc-500 print:text-zinc-700 print:bg-transparent">
                  <FileText className="h-3.5 w-3.5" />
                  DRAFT QUOTATION
                </div>
              )}
            </div>

            <div className="mt-3 space-y-0.5 text-xs font-mono">
              <p className="text-zinc-500 print:text-zinc-600">
                Issue Date: <span className="text-zinc-800 dark:text-zinc-200 font-semibold print:text-black">{invoice.created_at?.slice(0, 10)}</span>
              </p>
              <p className={`font-semibold ${invoice.is_overdue ? "text-rose-600 print:text-rose-800" : "text-zinc-800 dark:text-zinc-200 print:text-black"}`}>
                Payment Due: <span className="underline decoration-dotted">{invoice.due_date}</span>
              </p>
              {invoice.paid_at && (
                <p className="text-emerald-600 print:text-emerald-800 text-[11px]">
                  Settled On: {invoice.paid_at.slice(0, 10)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bill-To & Contract Terms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 text-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 print:text-zinc-500">
              Billed To
            </span>
            <div className="mt-1.5 font-bold text-zinc-900 dark:text-zinc-100 text-sm print:text-black">
              {invoice.customer?.name || "Customer Account"}
            </div>
            <div className="text-zinc-600 dark:text-zinc-400 font-mono text-xs mt-0.5 print:text-zinc-700">
              {invoice.customer?.email}
            </div>
            <div className="text-zinc-400 text-[11px] font-mono mt-1 print:text-zinc-500">
              Account ID: {invoice.customer_id}
            </div>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 print:text-zinc-500">
              Subscription Agreement Reference
            </span>
            {invoice.subscription ? (
              <div>
                <Link
                  href={`/subscriptions/${invoice.subscription_id}`}
                  className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm hover:underline print:text-black print:no-underline"
                >
                  {invoice.subscription.sub_number}
                </Link>
                <div className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5 print:text-zinc-700">
                  Plan: {invoice.subscription.plan?.name || "Standard Plan"} ({invoice.subscription.plan?.billing_interval || "MONTHLY"})
                </div>
                <div className="text-zinc-500 text-[11px] font-mono mt-0.5 print:text-zinc-600">
                  Terms: {invoice.subscription.payment_terms || "NET_30"}
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 print:text-zinc-600">Standalone Invoice</div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-400 text-zinc-500 dark:text-zinc-400 print:text-zinc-700 text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-2.5">Item / Service Description</th>
                <th className="pb-2.5 text-center">Qty</th>
                <th className="pb-2.5 text-right">Unit Price</th>
                <th className="pb-2.5 text-right">Tax (18%)</th>
                <th className="pb-2.5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 print:divide-zinc-200 font-mono">
              {subLines.length > 0 ? (
                subLines.map((line) => (
                  <tr key={line.id} className="break-inside-avoid">
                    <td className="py-3 pr-2 font-sans font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                      <div>{line.product?.name || "Subscription Service Item"}</div>
                      {line.variant && (
                        <div className="text-[11px] text-zinc-500 font-sans font-normal print:text-zinc-600">
                          Variant: {line.variant.variant_name} (+${Number(line.variant.extra_price).toFixed(2)})
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center text-zinc-700 dark:text-zinc-300 print:text-black">
                      {line.quantity}
                    </td>
                    <td className="py-3 text-right text-zinc-700 dark:text-zinc-300 print:text-black">
                      ${Number(line.unit_price).toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-zinc-500 print:text-zinc-700">
                      ${Number(line.tax_amount).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                      ${Number(line.line_total).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="break-inside-avoid">
                  <td className="py-3 font-sans font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                    Recurring Subscription Service
                  </td>
                  <td className="py-3 text-center text-zinc-700 dark:text-zinc-300 print:text-black">1</td>
                  <td className="py-3 text-right text-zinc-700 dark:text-zinc-300 print:text-black">
                    ${invoice.subtotal.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-zinc-500 print:text-zinc-700">
                    ${invoice.tax_amount.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                    ${invoice.subtotal.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-400 pt-5 break-inside-avoid">
          <div className="text-xs text-zinc-500 max-w-sm space-y-1.5 print:text-zinc-700">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 print:text-black uppercase tracking-wider text-[11px]">
              Remittance & Banking Instructions
            </span>
            <div className="text-[11px] space-y-0.5 font-mono text-zinc-600 print:text-zinc-700">
              <p>Bank: JPMorgan Chase Bank NA</p>
              <p>Account Name: Brightloop Software Inc.</p>
              <p>Account Number: 881920-BL • Routing / ABA: 021000021</p>
              <p>SWIFT / BIC: CHASUS33 • Reference: {invoice.invoice_number}</p>
            </div>
            <p className="text-[10px] text-zinc-400 print:text-zinc-500 italic mt-2">
              Payment due within agreed payment terms. Thank you for your business.
            </p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs bg-zinc-50 dark:bg-zinc-900/40 print:bg-transparent p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800 print:border-zinc-300">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100 print:text-black font-medium">
                ${invoice.subtotal.toFixed(2)}
              </span>
            </div>

            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 print:text-emerald-800 font-medium">
                <span>Discount Applied:</span>
                <span className="font-mono tabular-nums">
                  -${invoice.discount_amount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
              <span>Tax (18%):</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100 print:text-black font-medium">
                ${invoice.tax_amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-400 pt-2 font-bold text-zinc-900 dark:text-zinc-50 print:text-black text-sm">
              <span>Total Invoiced:</span>
              <span className="font-mono tabular-nums">
                ${invoice.total_amount.toFixed(2)}
              </span>
            </div>

            {invoice.paid_amount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 print:text-emerald-800 font-medium">
                <span>Amount Paid:</span>
                <span className="font-mono tabular-nums">
                  -${invoice.paid_amount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t-2 border-zinc-900 dark:border-zinc-100 print:border-zinc-900 pt-2 font-bold text-sm">
              <span className="text-zinc-900 dark:text-zinc-100 print:text-black">Balance Due:</span>
              <span
                className={`font-mono tabular-nums text-base ${
                  invoice.balance_due === 0
                    ? "text-emerald-600 print:text-emerald-800"
                    : invoice.is_overdue
                    ? "text-rose-600 print:text-rose-800"
                    : "text-zinc-900 dark:text-zinc-100 print:text-black"
                }`}
              >
                ${invoice.balance_due.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Linked Payments History Section */}
        <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pt-6 break-inside-avoid">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 print:text-zinc-600">
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
            <div className="rounded-md border border-dashed border-zinc-200 dark:border-zinc-800 print:border-zinc-300 p-4 text-center text-xs text-zinc-400 print:text-zinc-500">
              No payments recorded against this invoice yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 text-[11px] text-zinc-400 print:text-zinc-600 font-medium">
                    <th className="py-2">Payment Date</th>
                    <th className="py-2">Method</th>
                    <th className="py-2">Reference / Notes</th>
                    <th className="py-2 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 print:divide-zinc-200 font-mono">
                  {(invoice.payments || []).map((pay) => (
                    <tr key={pay.id} className="py-2 break-inside-avoid">
                      <td className="py-2 text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                        {pay.payment_date}
                      </td>
                      <td className="py-2 font-sans font-medium text-zinc-800 dark:text-zinc-200 print:text-black">
                        {pay.payment_method}
                      </td>
                      <td className="py-2 font-sans text-zinc-500 print:text-zinc-600">
                        {pay.notes || "—"}
                      </td>
                      <td className="py-2 text-right font-medium text-emerald-600 print:text-emerald-800">
                        ${Number(pay.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Print Footer Note */}
        <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pt-4 text-center text-[10px] text-zinc-400 print:text-zinc-500 font-mono">
          Brightloop Software Inc. • Registered in Delaware, USA • Outloop Subscription Engine v9.0 • Computer-generated tax document
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
