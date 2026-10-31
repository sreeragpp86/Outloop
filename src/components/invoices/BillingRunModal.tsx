"use client";

import React, { useState } from "react";
import { X, Play, Loader2, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface BillingRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunComplete: () => void;
}

export function BillingRunModal({
  isOpen,
  onClose,
  onRunComplete,
}: BillingRunModalProps) {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    createdCount: number;
    skippedCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    try {
      setRunning(true);
      setError(null);
      setResult(null);

      const res = await fetch("/api/invoices/billing-run", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute billing engine");
      }

      setResult({
        message: data.message,
        createdCount: data.created_count,
        skippedCount: data.skipped_count,
      });

      toast(`Billing run completed: ${data.created_count} invoice(s) generated`, "success");
      onRunComplete();
    } catch (err: any) {
      setError(err.message || "Failed to execute billing run");
      toast(err.message || "Failed to execute billing run", "error");
    } finally {
      setRunning(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Play className="h-3.5 w-3.5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Automated Billing Day Engine
              </h3>
              <p className="text-[11px] text-zinc-500">
                Batch recurring billing cycle runner
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
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

        {/* Content */}
        {!result ? (
          <div className="mt-4 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
            <p>
              The billing engine will execute the automated recurrence pipeline for all active subscriptions:
            </p>
            <ul className="space-y-1.5 pl-1">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Idempotent Cycle Verification:</strong> Checks each active contract to verify whether an invoice for the current interval was already issued.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Draft Invoice Creation:</strong> Compiles contract lines, variant surcharges, discount limits, and calculates tax (18%).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Payment Terms:</strong> Computes the exact due date (e.g. Net 15, Net 30, or Immediate) per client agreement.
                </span>
              </li>
            </ul>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleClose}
                disabled={running}
                className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRun}
                disabled={running}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {running ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Executing Run...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Run Billing Day
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{result.message}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-md border border-zinc-200 p-2.5 dark:border-zinc-800">
                <div className="font-mono text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {result.createdCount}
                </div>
                <div className="text-[11px] text-zinc-500">Invoices Generated</div>
              </div>
              <div className="rounded-md border border-zinc-200 p-2.5 dark:border-zinc-800">
                <div className="font-mono text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {result.skippedCount}
                </div>
                <div className="text-[11px] text-zinc-500">Skipped (Billed)</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
