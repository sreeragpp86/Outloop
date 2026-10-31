"use client";

import React, { useState, useEffect } from "react";
import { X, DollarSign, CreditCard, Calendar, FileText, Loader2, CheckCircle2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  balanceDue: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  invoiceId,
  invoiceNumber,
  totalAmount,
  balanceDue,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount(balanceDue != null ? balanceDue.toFixed(2) : "0.00");
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod("Bank Transfer");
      setNotes("");
      setError(null);
    }
  }, [isOpen, balanceDue]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than $0.00");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          payment_method: paymentMethod,
          payment_date: paymentDate,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record payment");
      }

      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Register Payment
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              {invoiceNumber} • Total: ${totalAmount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Payment Amount ($)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-md border border-zinc-200 bg-white pl-7 pr-3 py-1.5 text-xs font-mono text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-400">
              Remaining balance: <span className="font-mono font-medium">${balanceDue.toFixed(2)}</span>
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="Bank Transfer">Bank Transfer (ACH / Wire)</option>
              <option value="Credit Card">Credit Card</option>
              <option value="UPI">UPI / Instant Pay</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Payment Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Memo / Reference Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Wire confirmation #849102"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
