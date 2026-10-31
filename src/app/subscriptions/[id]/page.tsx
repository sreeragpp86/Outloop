"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { StageBar } from "@/components/subscriptions/StageBar";
import { LineItemsTable, LineItemForm } from "@/components/subscriptions/LineItemsTable";
import { TotalsSummary } from "@/components/subscriptions/TotalsSummary";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Save, ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { SubscriptionStage } from "@/types/database";

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Core Subscription Data
  const [subNumber, setSubNumber] = useState("");
  const [stage, setStage] = useState<SubscriptionStage>("DRAFT");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [planId, setPlanId] = useState("");
  const [planName, setPlanName] = useState("");
  const [canPause, setCanPause] = useState(true);
  const [paymentTerms, setPaymentTerms] = useState("Immediate Payment");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState<string | null>(null);

  // Lines & Discounts
  const [lines, setLines] = useState<LineItemForm[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<any | null>(null);

  // Bootstrap Options
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);

  // 1. Fetch bootstrap catalogue and subscription data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [bootRes, subRes] = await Promise.all([
          fetch("/api/bootstrap"),
          fetch(`/api/subscriptions/${id}`),
        ]);

        if (!subRes.ok) throw new Error("Failed to load subscription");

        const bootData = await bootRes.json();
        const subData = await subRes.json();

        setAvailableProducts(bootData.products || []);
        setAvailablePlans(bootData.plans || []);
        setAvailableDiscounts(bootData.discounts || []);

        setSubNumber(subData.sub_number);
        setStage(subData.stage);
        setCustomerId(subData.customer_id);
        setCustomerName(subData.customer?.name || "Customer");
        setPlanId(subData.plan_id);
        setPlanName(subData.plan?.name || "Plan");
        setCanPause(subData.plan?.can_pause ?? true);
        setPaymentTerms(subData.payment_terms || "Immediate Payment");
        setStartDate(subData.start_date || "");
        setExpiryDate(subData.expiry_date || "");
        setAppliedDiscount(subData.discount || null);

        // Format lines
        const loadedLines: LineItemForm[] = (subData.lines || []).map((l: any) => ({
          id: l.id,
          product_id: l.product_id,
          variant_id: l.variant_id,
          product_name: l.product?.name || "Service",
          variant_name: l.variant?.variant_name || null,
          base_price: Number(l.product?.sales_price || l.unit_price || 0),
          extra_price: Number(l.variant?.extra_price || 0),
          quantity: Number(l.quantity) || 1,
          tax_rate: Number(l.product?.tax_rate || 18.0),
          unit_price: Number(l.unit_price),
          tax_amount: Number(l.tax_amount),
          line_total: Number(l.line_total),
        }));

        setLines(loadedLines);
      } catch (err: any) {
        setErrorToast(err.message || "Failed to load contract");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Real-time calculations
  let subtotal = 0;
  let totalQuantity = 0;
  lines.forEach((l) => {
    subtotal += l.line_total;
    totalQuantity += l.quantity;
  });
  subtotal = Number(subtotal.toFixed(2));

  // Stage transition handler
  const handleTransition = async (newStage: SubscriptionStage) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to transition stage");
      }

      setStage(newStage);
      setSuccessToast(`Lifecycle state updated to ${newStage}`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setErrorToast(err.message);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  // Save changes handler (metadata + lines + discounts)
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setErrorToast(null);

      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          payment_terms: paymentTerms,
          start_date: startDate,
          expiry_date: expiryDate || null,
          discount_code: appliedDiscount?.code || null,
          lines: lines.map((l) => ({
            id: l.id.startsWith("temp_") ? undefined : l.id,
            product_id: l.product_id,
            variant_id: l.variant_id,
            quantity: l.quantity,
            base_price: l.base_price,
            extra_price: l.extra_price,
            tax_rate: l.tax_rate,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save changes");
      }

      setSuccessToast("Contract changes and calculations saved successfully.");
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setErrorToast(err.message || "Failed to save contract");
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading contract studio...
        </div>
      </div>
    );
  }

  const isClosed = stage === "CLOSED";

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title={subNumber}
        description={`Customer: ${customerName} • Plan: ${planName}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Subscriptions", href: "/subscriptions" },
          { label: subNumber },
        ]}
        badge={<StatusBadge stage={stage} />}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/subscriptions"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Link>

            {!isClosed && (
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Changes
              </button>
            )}
          </div>
        }
      />

      {/* Interactive Stage Pipeline Bar */}
      <StageBar
        currentStage={stage}
        canPause={canPause}
        onTransition={handleTransition}
      />

      {/* Header Metadata Fields */}
      <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
          Agreement Terms & Cadence
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-zinc-500">
              Customer
            </label>
            <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
              {customerName}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-500">
              Billing Plan
            </label>
            {isClosed ? (
              <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                {planName}
              </div>
            ) : (
              <select
                value={planId}
                onChange={(e) => {
                  setPlanId(e.target.value);
                  const p = availablePlans.find((x) => x.id === e.target.value);
                  if (p) {
                    setPlanName(p.name);
                    setCanPause(p.can_pause);
                  }
                }}
                className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {availablePlans.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name} ({pl.billing_interval})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-500">
              Payment Terms
            </label>
            {isClosed ? (
              <div className="mt-1 text-zinc-900 dark:text-zinc-100 font-medium">
                {paymentTerms}
              </div>
            ) : (
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="Immediate Payment">Immediate Payment</option>
                <option value="15 Days">15 Days Net</option>
                <option value="30 Days Net">30 Days Net</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-500">
              Schedule (Start to Expiry)
            </label>
            <div className="mt-1 font-mono text-zinc-800 dark:text-zinc-200">
              {startDate || "—"} to {expiryDate || "Ongoing"}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Line Items Table */}
      <LineItemsTable
        lines={lines}
        availableProducts={availableProducts}
        readOnly={isClosed}
        onChange={setLines}
      />

      {/* Discount & Totals Summary Panel */}
      <TotalsSummary
        subtotal={subtotal}
        totalQuantity={totalQuantity}
        appliedDiscount={appliedDiscount}
        availableDiscounts={availableDiscounts}
        readOnly={isClosed}
        onApplyDiscount={setAppliedDiscount}
      />
    </div>
  );
}
