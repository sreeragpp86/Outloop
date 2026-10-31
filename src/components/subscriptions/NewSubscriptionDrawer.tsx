"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, Tag, Loader2, Sparkles } from "lucide-react";

interface ProductWithVariants {
  id: string;
  name: string;
  sales_price: number;
  tax_rate: number;
  variants?: Array<{
    id: string;
    variant_name: string;
    extra_price: number;
  }>;
}

export interface NewSubscriptionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customers?: Array<{ id: string; name: string; email: string }>;
  plans?: Array<{ id: string; name: string; billing_interval: string; min_quantity: number }>;
  products?: ProductWithVariants[];
  discounts?: Array<{ id: string; code: string; discount_type: string; value: number }>;
  onCreated?: (newSubId: string) => void;
}

export function NewSubscriptionDrawer({
  isOpen,
  onClose,
  customers: initialCustomers,
  plans: initialPlans,
  products: initialProducts,
  discounts: initialDiscounts,
  onCreated,
}: NewSubscriptionDrawerProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email: string }>>(initialCustomers || []);
  const [plans, setPlans] = useState<Array<{ id: string; name: string; billing_interval: string; min_quantity: number }>>(initialPlans || []);
  const [products, setProducts] = useState<ProductWithVariants[]>(initialProducts || []);
  const [discounts, setDiscounts] = useState<Array<{ id: string; code: string; discount_type: string; value: number }>>(initialDiscounts || []);

  // Form states
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [paymentTerms, setPaymentTerms] = useState("Immediate Payment");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [discountCode, setDiscountCode] = useState("");

  const [lines, setLines] = useState<Array<{
    product_id: string;
    variant_id: string | null;
    quantity: number;
  }>>([
    {
      product_id: products[0]?.id || "",
      variant_id: null,
      quantity: 1,
    },
  ]);

  // Load bootstrap catalogue if not provided
  useEffect(() => {
    if (!isOpen) return;

    if (initialCustomers?.length && initialPlans?.length && initialProducts?.length) {
      setCustomers(initialCustomers);
      setPlans(initialPlans);
      setProducts(initialProducts);
      setDiscounts(initialDiscounts || []);
      if (!customerId && initialCustomers[0]) setCustomerId(initialCustomers[0].id);
      if (!planId && initialPlans[0]) setPlanId(initialPlans[0].id);
      if (lines.length === 1 && !lines[0]?.product_id && initialProducts[0]) {
        setLines([{ product_id: initialProducts[0].id, variant_id: null, quantity: 1 }]);
      }
      return;
    }

    fetch("/api/bootstrap")
      .then((res) => res.json())
      .then((data) => {
        const custs = data.customers || [];
        const pls = data.plans || [];
        const prods = data.products || [];
        const discs = data.discounts || [];
        setCustomers(custs);
        setPlans(pls);
        setProducts(prods);
        setDiscounts(discs);
        if (custs.length > 0 && !customerId) setCustomerId(custs[0].id);
        if (pls.length > 0 && !planId) setPlanId(pls[0].id);
        if (prods.length > 0 && (lines.length === 0 || !lines[0]?.product_id)) {
          setLines([{ product_id: prods[0].id, variant_id: null, quantity: 1 }]);
        }
      })
      .catch((err) => {
        console.error("Failed to load bootstrap data:", err);
      });
  }, [isOpen, initialCustomers, initialPlans, initialProducts, initialDiscounts]);

  if (!isOpen) return null;

  // Real-time calculations
  let subtotal = 0;
  let totalQty = 0;
  lines.forEach((l) => {
    const prod = products.find((p) => p.id === l.product_id);
    const variant = prod?.variants?.find((v) => v.id === l.variant_id);
    const base = Number(prod?.sales_price || 0);
    const extra = Number(variant?.extra_price || 0);
    // add variant delta before tax calculation
    const unitPrice = base + extra;
    const qty = l.quantity || 1;
    subtotal += unitPrice * qty;
    totalQty += qty;
  });

  // Check discount
  let discountTotal = 0;
  const appliedRule = discounts.find((d) => d.code === discountCode.trim().toUpperCase());
  if (appliedRule) {
    if (appliedRule.discount_type === "PERCENTAGE") {
      discountTotal = Number(((subtotal * Number(appliedRule.value)) / 100).toFixed(2));
    } else {
      discountTotal = Number(Math.min(subtotal, Number(appliedRule.value)).toFixed(2));
    }
  }

  const netTaxable = Math.max(0, Number((subtotal - discountTotal).toFixed(2)));
  const taxTotal = Number(((netTaxable * 18) / 100).toFixed(2));
  const grandTotal = Number((netTaxable + taxTotal).toFixed(2));

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        product_id: products[0]?.id || "",
        variant_id: null,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: string, val: any) => {
    const copy = [...lines];
    const current = copy[idx];
    if (!current) return;

    if (field === "product_id") {
      copy[idx] = { ...current, product_id: val, variant_id: null };
    } else if (field === "variant_id") {
      copy[idx] = { ...current, variant_id: val ? val : null };
    } else if (field === "quantity") {
      copy[idx] = { ...current, quantity: Math.max(1, parseInt(val, 10) || 1) };
    }
    setLines(copy);
  };

  const handleSubmit = async (stage: "DRAFT" | "QUOTATION") => {
    try {
      setSubmitting(true);
      setError(null);

      const payloadLines = lines.map((l) => {
        const prod = products.find((p) => p.id === l.product_id);
        const variant = prod?.variants?.find((v) => v.id === l.variant_id);
        return {
          product_id: l.product_id,
          variant_id: l.variant_id,
          quantity: l.quantity,
          base_price: Number(prod?.sales_price || 0),
          extra_price: Number(variant?.extra_price || 0),
          tax_rate: Number(prod?.tax_rate || 18.0),
        };
      });

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          plan_id: planId,
          discount_code: discountCode || null,
          payment_terms: paymentTerms,
          start_date: startDate,
          expiry_date: expiryDate || null,
          lines: payloadLines,
          stage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create quotation");
      }

      onClose();
      if (onCreated) {
        onCreated(data.id);
      } else {
        router.push(`/subscriptions/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create subscription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              New Quotation & Subscription
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Configure contract parameters, variant items, and billing terms.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-md bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Customer Profile
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Subscription Plan
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {plans.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name} ({pl.billing_interval} • Min Qty: {pl.min_quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="Immediate Payment">Immediate Payment</option>
                <option value="15 Days">15 Days Net</option>
                <option value="30 Days Net">30 Days Net</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Line Items Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Line Items ({lines.length})
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1 text-xs text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 font-medium"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, idx) => {
                const prod = products.find((p) => p.id === line.product_id);
                const variants = prod?.variants || [];
                const variant = variants.find((v) => v.id === line.variant_id);
                const unitPrice = Number(prod?.sales_price || 0) + Number(variant?.extra_price || 0);
                const total = unitPrice * line.quantity;

                return (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200/80 bg-zinc-50/50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs"
                  >
                    <div className="flex-1 min-w-[140px]">
                      <select
                        value={line.product_id}
                        onChange={(e) => handleLineChange(idx, "product_id", e.target.value)}
                        className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${Number(p.sales_price).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {variants.length > 0 && (
                      <div className="min-w-[120px]">
                        <select
                          value={line.variant_id || ""}
                          onChange={(e) => handleLineChange(idx, "variant_id", e.target.value)}
                          className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          <option value="">Standard</option>
                          {variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.variant_name} (+${Number(v.extra_price).toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-zinc-400">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, "quantity", e.target.value)}
                        className="w-14 rounded border border-zinc-200 bg-white px-1.5 py-1 text-center font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>

                    <div className="w-20 text-right font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      ${total.toFixed(2)}
                    </div>

                    <button
                      type="button"
                      disabled={lines.length <= 1}
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1 text-zinc-400 hover:text-rose-600 disabled:opacity-20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coupon Code Input */}
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Discount Code (e.g. BULK10)"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="flex-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          {/* Summary Box */}
          <div className="rounded-md border border-zinc-200/80 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/60 space-y-1">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">${subtotal.toFixed(2)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({discountCode}):</span>
                <span className="font-mono tabular-nums">-${discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Tax (18%):</span>
              <span className="font-mono tabular-nums">${taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-1.5 font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
              <span>Grand Total:</span>
              <span className="font-mono text-sm tabular-nums">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("DRAFT")}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("QUOTATION")}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Create Quotation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
