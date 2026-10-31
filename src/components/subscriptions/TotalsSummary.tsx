"use client";

import React, { useState } from "react";
import { Tag, Check, AlertCircle, X } from "lucide-react";

interface DiscountRule {
  id: string;
  code: string;
  discount_type: "PERCENTAGE" | "FIXED";
  value: number;
  min_quantity: number;
  min_amount: number;
  is_active: boolean;
}

interface TotalsSummaryProps {
  subtotal: number;
  totalQuantity: number;
  appliedDiscount: DiscountRule | null;
  availableDiscounts: DiscountRule[];
  readOnly?: boolean;
  onApplyDiscount: (rule: DiscountRule | null) => void;
}

export function TotalsSummary({
  subtotal,
  totalQuantity,
  appliedDiscount,
  availableDiscounts,
  readOnly = false,
  onApplyDiscount,
}: TotalsSummaryProps) {
  const [couponInput, setCouponInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Calculate discount total
  let discountTotal = 0;
  if (appliedDiscount) {
    if (appliedDiscount.discount_type === "PERCENTAGE") {
      discountTotal = Number(((subtotal * Number(appliedDiscount.value)) / 100).toFixed(2));
    } else {
      discountTotal = Number(Math.min(subtotal, Number(appliedDiscount.value)).toFixed(2));
    }
  }

  // 2. Tax calculations (18%)
  const netTaxable = Math.max(0, Number((subtotal - discountTotal).toFixed(2)));
  const taxTotal = Number(((netTaxable * 18) / 100).toFixed(2));
  const grandTotal = Number((netTaxable + taxTotal).toFixed(2));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const code = couponInput.trim().toUpperCase();
    if (!code) {
      onApplyDiscount(null);
      return;
    }

    const rule = availableDiscounts.find((d) => d.code === code && d.is_active);
    if (!rule) {
      setErrorMessage(`Invalid code "${code}". Available: BULK10, SCALE500.`);
      return;
    }

    // Validate minimum quantity threshold
    if (totalQuantity < Number(rule.min_quantity || 0)) {
      setErrorMessage(
        `Coupon ${rule.code} requires a minimum order of ${rule.min_quantity} total units (current: ${totalQuantity}).`
      );
      return;
    }

    // Validate minimum subtotal threshold
    if (subtotal < Number(rule.min_amount || 0)) {
      setErrorMessage(
        `Coupon ${rule.code} requires a minimum order subtotal of $${Number(rule.min_amount).toFixed(2)} (current: $${subtotal.toFixed(2)}).`
      );
      return;
    }

    onApplyDiscount(rule);
    setCouponInput("");
  };

  const handleRemoveCoupon = () => {
    onApplyDiscount(null);
    setErrorMessage(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Coupon / Promotion Input */}
      <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Discount & Promotion Rules
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Enter an approved coupon code to apply tiered volume discounts.
        </p>

        {!readOnly && (
          <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="e.g. BULK10 or SCALE500"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white pl-8 pr-3 py-1.5 font-mono text-xs text-zinc-900 uppercase placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900"
            >
              Apply Discount
            </button>
          </form>
        )}

        {errorMessage && (
          <div className="mt-2 flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {appliedDiscount && (
          <div className="mt-3 flex items-center justify-between rounded-md border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="font-mono font-bold">{appliedDiscount.code}</span>
                <span className="ml-1 text-[11px] opacity-80">
                  ({appliedDiscount.discount_type === "PERCENTAGE"
                    ? `${appliedDiscount.value}% off`
                    : `$${Number(appliedDiscount.value).toFixed(2)} fixed deduction`})
                </span>
              </div>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="rounded p-1 text-emerald-700 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* Quick hint for demo */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400">
          <span>Active Rules:</span>
          <button
            type="button"
            onClick={() => setCouponInput("BULK10")}
            className="font-mono text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 underline"
          >
            BULK10 (10%, min 5 qty)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setCouponInput("SCALE500")}
            className="font-mono text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 underline"
          >
            SCALE500 ($500, min $2k)
          </button>
        </div>
      </div>

      {/* Financial Breakdown Panel */}
      <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 pb-2 dark:border-zinc-800">
          Payment & Tax Breakdown
        </h3>

        <div className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Subtotal ({totalQuantity} items):</span>
            <span className="font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {discountTotal > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>
                Discount ({appliedDiscount?.code || "Coupon"}):
              </span>
              <span className="font-mono font-medium tabular-nums">
                -${discountTotal.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Taxable Amount:</span>
            <span className="font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
              ${netTaxable.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Tax (18.00% GST/VAT):</span>
            <span className="font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
              ${taxTotal.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-zinc-200/80 pt-3 dark:border-zinc-800 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Grand Total:
            </span>
            <span className="font-mono text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
