"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  Package,
  Layers,
  Percent,
  Lock,
  Plus,
  ShieldAlert,
} from "lucide-react";

export default function ProductsPage() {
  const { role, setRole } = useRole();

  if (role !== "ADMIN") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Products & Plans"
          description="Catalogue pricing, variants, and enterprise discount rules."
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Products & Plans" },
          ]}
        />

        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Administrator Privileges Required
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            Staff members have read-only quotation and billing access. Base pricing,
            product variants, and discount rules are restricted to Admin.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setRole("ADMIN")}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Switch to Sarah Connor (Admin)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const products = [
    {
      id: "a0000000-0000-4000-8000-000000000001",
      name: "Brightloop Core Cloud",
      type: "SERVICE",
      sales_price: 120.0,
      cost_price: 30.0,
      tax_rate: 18.0,
      notes: "Dedicated high-availability multi-tenant cloud subscription",
    },
    {
      id: "a0000000-0000-4000-8000-000000000002",
      name: "Field Operations Module",
      type: "SERVICE",
      sales_price: 85.0,
      cost_price: 20.0,
      tax_rate: 18.0,
      notes: "Real-time telemetry and dispatched workforce tracking",
    },
    {
      id: "a0000000-0000-4000-8000-000000000003",
      name: "Enterprise ERP Connector",
      type: "SERVICE",
      sales_price: 250.0,
      cost_price: 60.0,
      tax_rate: 18.0,
      notes: "Bidirectional ERP synchronization gateway with custom schema mapping",
      variant: {
        name: "Brand: Odoo",
        extra_price: 560.0,
        total_price: 810.0,
      },
    },
  ];

  const plans = [
    {
      name: "Starter Monthly",
      interval: "MONTHLY",
      min_quantity: 1,
      can_pause: true,
      can_renew: true,
      auto_close: false,
    },
    {
      name: "Growth Yearly",
      interval: "YEARLY",
      min_quantity: 5,
      can_pause: true,
      can_renew: true,
      auto_close: false,
    },
    {
      name: "Enterprise Scale",
      interval: "YEARLY",
      min_quantity: 10,
      can_pause: true,
      can_renew: true,
      auto_close: false,
    },
  ];

  const discounts = [
    {
      code: "BULK10",
      type: "PERCENTAGE",
      value: "10%",
      condition: "Min Quantity: 5 units",
      status: "ACTIVE",
    },
    {
      code: "SCALE500",
      type: "FIXED",
      value: "$500.00",
      condition: "Min Order Amount: $2,000.00",
      status: "ACTIVE",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Subscription Plans"
        description="Configure product catalogue, Odoo ERP connector variants, recurring cadences, and discount structures."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Products & Plans" },
        ]}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Catalogue Offerings"
          value="3 Products"
          change="1 active variant"
          changeType="neutral"
          subtitle="Tax standard: 18.00%"
          icon={Package}
        />
        <MetricCard
          title="Billing Cadences"
          value="3 Plans"
          change="Monthly & Yearly"
          changeType="neutral"
          subtitle="Auto-renewal enabled"
          icon={Layers}
        />
        <MetricCard
          title="Discount Rules"
          value="2 Rules"
          change="Volume & Tiered"
          changeType="positive"
          subtitle="BULK10 & SCALE500"
          icon={Percent}
        />
      </div>

      {/* Products Table */}
      <div className="rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Product Catalogue & Variants
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Base list prices and variant deltas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200/70 bg-zinc-50/75 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Base Price</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Tax Rate</th>
                <th className="px-4 py-3">Variant Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-zinc-50/70 transition-colors dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {p.notes}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                    ${p.sales_price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-500">
                    ${p.cost_price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                    {p.tax_rate.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">
                    {p.variant ? (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60">
                        {p.variant.name} (+${p.variant.extra_price.toFixed(2)} $\rightarrow$ ${p.variant.total_price.toFixed(2)})
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plans & Discounts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Plans */}
        <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Subscription Plans
          </h2>
          <div className="space-y-3">
            {plans.map((pl) => (
              <div
                key={pl.name}
                className="flex items-center justify-between rounded-md border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {pl.name}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Min Quantity: {pl.min_quantity} unit(s) • Pause allowed
                  </div>
                </div>
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {pl.interval}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Discounts */}
        <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Promotional & Volume Discounts
          </h2>
          <div className="space-y-3">
            {discounts.map((d) => (
              <div
                key={d.code}
                className="flex items-center justify-between rounded-md border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {d.code}
                    </span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-mono font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
                      {d.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {d.condition}
                  </div>
                </div>
                <div className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {d.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
