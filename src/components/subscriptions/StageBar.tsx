"use client";

import React, { useState } from "react";
import { SubscriptionStage } from "@/types/database";
import {
  Send,
  CheckCircle,
  Zap,
  PauseCircle,
  PlayCircle,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface StageBarProps {
  currentStage: SubscriptionStage;
  canPause?: boolean;
  onTransition: (newStage: SubscriptionStage) => Promise<void>;
}

const ORDERED_STAGES: SubscriptionStage[] = [
  "DRAFT",
  "QUOTATION",
  "CONFIRMED",
  "ACTIVE",
  "CLOSED",
];

export function StageBar({ currentStage, canPause = true, onTransition }: StageBarProps) {
  const [loadingStage, setLoadingStage] = useState<SubscriptionStage | null>(null);

  const handleAction = async (targetStage: SubscriptionStage) => {
    try {
      setLoadingStage(targetStage);
      await onTransition(targetStage);
    } finally {
      setLoadingStage(null);
    }
  };

  const getStageIndex = (stage: SubscriptionStage) => {
    if (stage === "PAUSED") return 3; // Paused is a sub-state of Active
    return ORDERED_STAGES.indexOf(stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200/90 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:flex-row lg:items-center lg:justify-between">
      {/* Context-aware lifecycle action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {currentStage === "DRAFT" && (
          <button
            type="button"
            disabled={loadingStage !== null}
            onClick={() => handleAction("QUOTATION")}
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loadingStage === "QUOTATION" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send Quotation
          </button>
        )}

        {currentStage === "QUOTATION" && (
          <button
            type="button"
            disabled={loadingStage !== null}
            onClick={() => handleAction("CONFIRMED")}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
          >
            {loadingStage === "CONFIRMED" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            Confirm Order
          </button>
        )}

        {currentStage === "CONFIRMED" && (
          <button
            type="button"
            disabled={loadingStage !== null}
            onClick={() => handleAction("ACTIVE")}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
          >
            {loadingStage === "ACTIVE" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            Activate Subscription
          </button>
        )}

        {currentStage === "ACTIVE" && (
          <>
            {canPause && (
              <button
                type="button"
                disabled={loadingStage !== null}
                onClick={() => handleAction("PAUSED")}
                className="inline-flex items-center gap-1.5 rounded-md border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 shadow-xs hover:bg-orange-100 active:scale-[0.98] disabled:opacity-50 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300"
              >
                {loadingStage === "PAUSED" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <PauseCircle className="h-3.5 w-3.5" />
                )}
                Pause Subscription
              </button>
            )}

            <button
              type="button"
              disabled={loadingStage !== null}
              onClick={() => handleAction("CLOSED")}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {loadingStage === "CLOSED" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-zinc-500" />
              )}
              Close Subscription
            </button>
          </>
        )}

        {currentStage === "PAUSED" && (
          <button
            type="button"
            disabled={loadingStage !== null}
            onClick={() => handleAction("ACTIVE")}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
          >
            {loadingStage === "ACTIVE" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5" />
            )}
            Resume Subscription
          </button>
        )}

        {(currentStage === "CLOSED" || currentStage === "DRAFT") && (
          <button
            type="button"
            disabled={loadingStage !== null}
            onClick={() => handleAction("DRAFT")}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to Draft
          </button>
        )}
      </div>

      {/* Odoo ERP Chevron Pipeline Bar */}
      <div className="flex items-center overflow-x-auto rounded-md border border-zinc-200/80 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-800/50">
        {ORDERED_STAGES.map((stg, index) => {
          const isActive = currentStage === stg;
          const isPassed = currentIndex > index && currentStage !== "PAUSED";
          const isPaused = currentStage === "PAUSED" && stg === "ACTIVE";

          let badgeStyles = "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400";
          if (isActive) {
            badgeStyles = "bg-white text-zinc-900 font-semibold shadow-xs dark:bg-zinc-900 dark:text-zinc-50";
          } else if (isPaused) {
            badgeStyles = "bg-orange-500/15 text-orange-700 font-semibold border border-orange-500/30 dark:text-orange-400";
          } else if (isPassed) {
            badgeStyles = "text-zinc-700 dark:text-zinc-300 font-medium";
          }

          return (
            <div key={stg} className="flex items-center">
              {index > 0 && (
                <span className="mx-1 text-zinc-300 dark:text-zinc-700 text-xs">
                  ›
                </span>
              )}
              <span
                className={`flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase transition-all ${badgeStyles}`}
              >
                {isPaused ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                    PAUSED
                  </>
                ) : (
                  <>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                    {stg}
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
