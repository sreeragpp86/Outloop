"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

export interface LineItemForm {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name?: string | null;
  base_price: number;
  extra_price: number;
  quantity: number;
  tax_rate: number;
  unit_price: number;
  tax_amount: number;
  line_total: number;
}

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

interface LineItemsTableProps {
  lines: LineItemForm[];
  availableProducts: ProductWithVariants[];
  readOnly?: boolean;
  onChange: (updatedLines: LineItemForm[]) => void;
}

export function LineItemsTable({
  lines,
  availableProducts,
  readOnly = false,
  onChange,
}: LineItemsTableProps) {
  const handleProductChange = (index: number, newProductId: string) => {
    const product = availableProducts.find((p) => p.id === newProductId);
    if (!product) return;

    const updated = [...lines];
    const existing = updated[index];
    if (!existing) return;

    const basePrice = Number(product.sales_price);
    const taxRate = Number(product.tax_rate || 18.0);
    const extraPrice = 0;
    // add variant delta before tax calculation
    const unitPrice = basePrice + extraPrice;
    const qty = existing.quantity || 1;
    const lineTotal = Number((unitPrice * qty).toFixed(2));
    const taxAmount = Number(((lineTotal * taxRate) / 100).toFixed(2));

    updated[index] = {
      ...existing,
      product_id: product.id,
      product_name: product.name,
      variant_id: null,
      variant_name: null,
      base_price: basePrice,
      extra_price: extraPrice,
      unit_price: unitPrice,
      tax_rate: taxRate,
      line_total: lineTotal,
      tax_amount: taxAmount,
    };

    onChange(updated);
  };

  const handleVariantChange = (index: number, newVariantId: string | null) => {
    const updated = [...lines];
    const line = updated[index];
    if (!line) return;

    const product = availableProducts.find((p) => p.id === line.product_id);
    const variant = product?.variants?.find((v) => v.id === newVariantId);

    const extraPrice = variant ? Number(variant.extra_price) : 0;
    // add variant delta before tax calculation
    const unitPrice = line.base_price + extraPrice;
    const lineTotal = Number((unitPrice * line.quantity).toFixed(2));
    const taxAmount = Number(((lineTotal * line.tax_rate) / 100).toFixed(2));

    updated[index] = {
      ...line,
      variant_id: variant ? variant.id : null,
      variant_name: variant ? variant.variant_name : null,
      extra_price: extraPrice,
      unit_price: unitPrice,
      line_total: lineTotal,
      tax_amount: taxAmount,
    };

    onChange(updated);
  };

  const handleQuantityChange = (index: number, rawQty: number) => {
    const qty = Math.max(1, rawQty || 1);
    const updated = [...lines];
    const line = updated[index];
    if (!line) return;

    const lineTotal = Number((line.unit_price * qty).toFixed(2));
    const taxAmount = Number(((lineTotal * line.tax_rate) / 100).toFixed(2));

    updated[index] = {
      ...line,
      quantity: qty,
      line_total: lineTotal,
      tax_amount: taxAmount,
    };

    onChange(updated);
  };

  const handleAddLine = () => {
    if (availableProducts.length === 0) return;
    const defaultProduct = availableProducts[0]!;
    const basePrice = Number(defaultProduct.sales_price);
    const taxRate = Number(defaultProduct.tax_rate || 18.0);
    const unitPrice = basePrice;
    const quantity = 1;
    const lineTotal = unitPrice * quantity;
    const taxAmount = Number(((lineTotal * taxRate) / 100).toFixed(2));

    const newLine: LineItemForm = {
      id: "temp_" + Math.random().toString(36).substring(2, 9),
      product_id: defaultProduct.id,
      variant_id: null,
      product_name: defaultProduct.name,
      variant_name: null,
      base_price: basePrice,
      extra_price: 0,
      quantity,
      tax_rate: taxRate,
      unit_price: unitPrice,
      tax_amount: taxAmount,
      line_total: lineTotal,
    };

    onChange([...lines, newLine]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    onChange(lines.filter((_, idx) => idx !== index));
  };

  return (
    <div className="rounded-lg border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Subscription Line Items
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real-time tax calculation and variant pricing deltas
          </p>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleAddLine}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <Plus className="h-3 w-3" />
            Add Line Item
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-200/70 bg-zinc-50/75 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 min-w-[200px]">Product</th>
              <th className="px-4 py-3 min-w-[180px]">Variant Delta</th>
              <th className="px-4 py-3 w-24 text-center">Quantity</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Tax (18%)</th>
              <th className="px-4 py-3 text-right">Line Total</th>
              {!readOnly && <th className="px-3 py-3 w-10 text-center"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {lines.map((line, idx) => {
              const currentProduct = availableProducts.find((p) => p.id === line.product_id);
              const variants = currentProduct?.variants || [];

              return (
                <tr
                  key={line.id || idx}
                  className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Product Column */}
                  <td className="px-4 py-3">
                    {readOnly ? (
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {line.product_name}
                      </span>
                    ) : (
                      <select
                        value={line.product_id}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${Number(p.sales_price).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Variant Column */}
                  <td className="px-4 py-3">
                    {variants.length > 0 ? (
                      readOnly ? (
                        line.variant_name ? (
                          <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {line.variant_name} (+${line.extra_price.toFixed(2)})
                          </span>
                        ) : (
                          <span className="text-zinc-400">Standard</span>
                        )
                      ) : (
                        <select
                          value={line.variant_id || ""}
                          onChange={(e) =>
                            handleVariantChange(idx, e.target.value ? e.target.value : null)
                          }
                          className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        >
                          <option value="">Standard (No Extra)</option>
                          {variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.variant_name} (+${Number(v.extra_price).toFixed(2)})
                            </option>
                          ))}
                        </select>
                      )
                    ) : (
                      <span className="text-zinc-400 text-xs">Standard</span>
                    )}
                  </td>

                  {/* Quantity Column */}
                  <td className="px-4 py-3 text-center">
                    {readOnly ? (
                      <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {line.quantity}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={line.quantity}
                        onChange={(e) =>
                          handleQuantityChange(idx, parseInt(e.target.value, 10))
                        }
                        className="w-16 rounded-md border border-zinc-200 bg-white px-2 py-1 text-center font-mono text-xs text-zinc-900 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    )}
                  </td>

                  {/* Unit Price */}
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                    ${line.unit_price.toFixed(2)}
                  </td>

                  {/* Tax Amount */}
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-zinc-500">
                    ${line.tax_amount.toFixed(2)}
                  </td>

                  {/* Line Total */}
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    ${line.line_total.toFixed(2)}
                  </td>

                  {/* Remove Button */}
                  {!readOnly && (
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lines.length <= 1}
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-rose-600 disabled:opacity-20 dark:hover:bg-zinc-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
