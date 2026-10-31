"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  Package,
  Layers,
  Percent,
  Lock,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Tag,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

export default function ProductsPage() {
  const { role, setRole } = useRole();

  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PRODUCTS" | "PLANS" | "DISCOUNTS">("PRODUCTS");

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bootstrap");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setPlans(data.plans || []);
        setDiscounts(data.discounts || []);
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

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
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Switch to Sarah Connor (Admin)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Subscription Plans"
        description="Configure product catalogue, enterprise connector variants, recurring cadences, and discount structures."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Products & Plans" },
        ]}
        actions={
          <button
            onClick={fetchCatalog}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Catalogue Offerings"
          value={`${products.length} Products`}
          change={`${totalVariants} active variant`}
          changeType="neutral"
          subtitle="Tax standard: 18.00%"
          icon={Package}
        />
        <MetricCard
          title="Billing Cadences"
          value={`${plans.length} Plans`}
          change="Monthly & Yearly"
          changeType="neutral"
          subtitle="Auto-renewal enabled"
          icon={Layers}
        />
        <MetricCard
          title="Discount Rules"
          value={`${discounts.length} Rules`}
          change="Volume & Tiered"
          changeType="positive"
          subtitle="BULK10 & SCALE500"
          icon={Percent}
        />
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("PRODUCTS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "PRODUCTS"
              ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          <span>Products & Variants</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PLANS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "PLANS"
              ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Subscription Plans</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">
            {plans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("DISCOUNTS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "DISCOUNTS"
              ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>Discount Rules</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800">
            {discounts.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Products & Variants */}
      {activeTab === "PRODUCTS" && (
        <div className="rounded-lg border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-medium">
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Sales Price</th>
                  <th className="py-2.5 px-4">Cost Price</th>
                  <th className="py-2.5 px-4">Tax Rate</th>
                  <th className="py-2.5 px-4">Configured Variants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                      <div>{p.name}</div>
                      <div className="text-[11px] text-zinc-400 font-normal">{p.notes || "—"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-sans font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {p.product_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      ${Number(p.sales_price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      ${Number(p.cost_price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {Number(p.tax_rate).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {p.variants && p.variants.length > 0 ? (
                        p.variants.map((v: any) => (
                          <div
                            key={v.id}
                            className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                          >
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">
                              {v.variant_name}
                            </span>
                            <span className="font-mono text-zinc-500">
                              (+${Number(v.extra_price).toFixed(2)})
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-zinc-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Subscription Plans */}
      {activeTab === "PLANS" && (
        <div className="rounded-lg border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-medium">
                  <th className="py-2.5 px-4">Plan Name</th>
                  <th className="py-2.5 px-4">Interval</th>
                  <th className="py-2.5 px-4">Min Quantity</th>
                  <th className="py-2.5 px-4">Pause Allowed</th>
                  <th className="py-2.5 px-4">Auto Renew</th>
                  <th className="py-2.5 px-4">Auto Close on End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                {plans.map((pl) => (
                  <tr key={pl.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                      {pl.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-sans font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {pl.billing_interval}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                      {pl.min_quantity} units
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {pl.can_pause ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-400 text-xs">
                          <XCircle className="h-3.5 w-3.5" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {pl.can_renew ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-400 text-xs">
                          <XCircle className="h-3.5 w-3.5" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-zinc-500">
                      {pl.auto_close_on_end ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Discount Rules */}
      {activeTab === "DISCOUNTS" && (
        <div className="rounded-lg border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-medium">
                  <th className="py-2.5 px-4">Coupon Code</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Value</th>
                  <th className="py-2.5 px-4">Eligibility Criteria</th>
                  <th className="py-2.5 px-4">Usage Count</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                {discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {d.code}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {d.discount_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {d.discount_type === "PERCENTAGE" ? `${d.value}% OFF` : `-$${Number(d.value).toFixed(2)}`}
                    </td>
                    <td className="py-3 px-4 font-sans text-zinc-600 dark:text-zinc-400 text-xs">
                      {d.min_quantity > 0 && `Min ${d.min_quantity} units`}
                      {d.min_quantity > 0 && d.min_amount > 0 && " • "}
                      {d.min_amount > 0 && `Min $${Number(d.min_amount).toLocaleString()} order`}
                      {!d.min_quantity && !d.min_amount && "No minimum threshold"}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {d.used_count || 0} / {d.max_uses || "∞"} used
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {d.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-400 text-xs font-medium">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
