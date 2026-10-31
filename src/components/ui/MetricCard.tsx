import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  icon?: LucideIcon;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  subtitle,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="group relative rounded-lg border border-zinc-200/80 bg-white p-4 shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-100 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <div className="font-mono text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-50">
          {value}
        </div>
        {change && (
          <span
            className={`font-mono text-xs font-medium ${
              changeType === "positive"
                ? "text-emerald-600 dark:text-emerald-400"
                : changeType === "negative"
                ? "text-rose-600 dark:text-rose-400"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </div>
      )}
    </div>
  );
}
