import React from "react";
import { SubscriptionStage, InvoiceStatus, UserRole } from "@/types/database";

interface StatusBadgeProps {
  stage: SubscriptionStage;
}

export function StatusBadge({ stage }: StatusBadgeProps) {
  const getStyles = () => {
    switch (stage) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
      case "CONFIRMED":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
      case "QUOTATION":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25";
      case "PAUSED":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/25";
      case "CLOSED":
      case "DRAFT":
      default:
        return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/25";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide uppercase font-mono ${getStyles()}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {stage}
    </span>
  );
}

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  isOverdue?: boolean;
}

export function InvoiceStatusBadge({ status, isOverdue = false }: InvoiceStatusBadgeProps) {
  const getStyles = () => {
    if (isOverdue && status !== "PAID" && status !== "CANCELLED") {
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    }
    switch (status) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
      case "CONFIRMED":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25";
      case "DRAFT":
      default:
        return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/25";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide uppercase font-mono ${getStyles()}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {isOverdue && status !== "PAID" && status !== "CANCELLED" ? "OVERDUE" : status}
    </span>
  );
}

interface RoleBadgeProps {
  role: UserRole | string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const normalized = (role || "").toUpperCase();
  const getStyles = () => {
    switch (normalized) {
      case "ADMIN":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25";
      case "STAFF":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25";
      case "CUSTOMER":
      default:
        return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/25";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase font-mono ${getStyles()}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {normalized}
    </span>
  );
}
