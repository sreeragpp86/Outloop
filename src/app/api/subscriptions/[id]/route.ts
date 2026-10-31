import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";
import { randomUUID } from "node:crypto";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured) {
      const res = await supabaseFetch(
        `subscriptions?id=eq.${id}&select=*,customer:profiles(*),plan:plans(*),discount:discounts(*),lines:subscription_lines(*,product:products(*),variant:product_variants(*))`
      );
      const list = await res.json();
      if (!list || list.length === 0) {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
      }
      return NextResponse.json(list[0]);
    }

    // SQLite fallback
    const db = getLocalDb();
    const row: any = db.query(`
      SELECT s.*,
        json_object('id', pr.id, 'name', pr.name, 'email', pr.email, 'role', pr.role) as customer,
        json_object('id', pl.id, 'name', pl.name, 'billing_interval', pl.billing_interval, 'min_quantity', pl.min_quantity, 'can_pause', pl.can_pause) as plan,
        CASE WHEN d.id IS NOT NULL THEN
          json_object('id', d.id, 'code', d.code, 'discount_type', d.discount_type, 'value', d.value)
        ELSE NULL END as discount
      FROM subscriptions s
      JOIN profiles pr ON s.customer_id = pr.id
      JOIN plans pl ON s.plan_id = pl.id
      LEFT JOIN discounts d ON s.discount_id = d.id
      WHERE s.id = ?
    `).get(id);

    if (!row) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const lines = db.query(`
      SELECT sl.*,
        json_object('id', p.id, 'name', p.name, 'sales_price', p.sales_price, 'tax_rate', p.tax_rate) as product,
        CASE WHEN pv.id IS NOT NULL THEN
          json_object('id', pv.id, 'variant_name', pv.variant_name, 'extra_price', pv.extra_price)
        ELSE NULL END as variant
      FROM subscription_lines sl
      JOIN products p ON sl.product_id = p.id
      LEFT JOIN product_variants pv ON sl.variant_id = pv.id
      WHERE sl.subscription_id = ?
    `).all(id).map((l: any) => ({
      ...l,
      product: JSON.parse(l.product),
      variant: l.variant ? JSON.parse(l.variant) : null,
    }));

    return NextResponse.json({
      ...row,
      customer: JSON.parse(row.customer),
      plan: JSON.parse(row.plan),
      discount: row.discount ? JSON.parse(row.discount) : null,
      lines,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Check if only updating stage
    if (body.stage && Object.keys(body).length === 1) {
      const validStages = ["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED"];
      if (!validStages.includes(body.stage)) {
        return NextResponse.json({ error: "Invalid stage transition" }, { status: 400 });
      }

      if (isSupabaseConfigured) {
        const patchRes = await supabaseFetch(`subscriptions?id=eq.${id}`, {
          method: "PATCH",
          body: JSON.stringify({ stage: body.stage }),
        });
        if (!patchRes.ok) throw new Error(await patchRes.text());
        return NextResponse.json({ success: true, stage: body.stage });
      }

      const db = getLocalDb();
      db.run("UPDATE subscriptions SET stage = ? WHERE id = ?", [body.stage, id]);
      return NextResponse.json({ success: true, stage: body.stage });
    }

    // 2. Full update (metadata and/or line items)
    const {
      stage,
      customer_id,
      plan_id,
      discount_code,
      payment_terms,
      start_date,
      expiry_date,
      lines,
    } = body;

    let subtotal = 0;
    let totalQty = 0;
    let computedLines: any[] = [];

    if (lines && Array.isArray(lines)) {
      computedLines = lines.map((line: any) => {
        const qty = Math.max(1, Number(line.quantity) || 1);
        const basePrice = Number(line.base_price) || Number(line.unit_price) || 0;
        const extraPrice = Number(line.extra_price) || 0;
        // add variant delta before tax calculation
        const unitPrice = basePrice + extraPrice;
        const lineTotal = Number((unitPrice * qty).toFixed(2));
        const taxRate = Number(line.tax_rate ?? 18.0);
        const taxAmount = Number(((lineTotal * taxRate) / 100).toFixed(2));

        subtotal += lineTotal;
        totalQty += qty;

        return {
          id: line.id || randomUUID(),
          subscription_id: id,
          product_id: line.product_id,
          variant_id: line.variant_id || null,
          quantity: qty,
          unit_price: unitPrice,
          tax_amount: taxAmount,
          line_total: lineTotal,
        };
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    let discountId: string | null = null;
    let discountTotal = 0;

    if (discount_code) {
      let discountRule: any = null;
      if (isSupabaseConfigured) {
        const dRes = await supabaseFetch(`discounts?code=eq.${discount_code.trim().toUpperCase()}&is_active=eq.true`);
        const dList = await dRes.json();
        if (dList && dList.length > 0) discountRule = dList[0];
      } else {
        discountRule = getLocalDb()
          .query(`SELECT * FROM discounts WHERE code = ? AND is_active = 1`)
          .get(discount_code.trim().toUpperCase());
      }

      if (discountRule) {
        const meetsQty = totalQty >= Number(discountRule.min_quantity || 0);
        const meetsAmount = subtotal >= Number(discountRule.min_amount || 0);

        if (meetsQty && meetsAmount) {
          discountId = discountRule.id;
          if (discountRule.discount_type === "PERCENTAGE") {
            discountTotal = Number(((subtotal * Number(discountRule.value)) / 100).toFixed(2));
          } else {
            discountTotal = Number(Math.min(subtotal, Number(discountRule.value)).toFixed(2));
          }
        }
      }
    }

    const netTaxable = Math.max(0, Number((subtotal - discountTotal).toFixed(2)));
    const taxTotal = Number(((netTaxable * 18) / 100).toFixed(2));
    const grandTotal = Number((netTaxable + taxTotal).toFixed(2));

    const updatePayload: any = {
      subtotal,
      discount_total: discountTotal,
      tax_total: taxTotal,
      grand_total: grandTotal,
    };

    if (stage) updatePayload.stage = stage;
    if (customer_id) updatePayload.customer_id = customer_id;
    if (plan_id) updatePayload.plan_id = plan_id;
    if (discountId !== undefined) updatePayload.discount_id = discountId;
    if (payment_terms) updatePayload.payment_terms = payment_terms;
    if (start_date) updatePayload.start_date = start_date;
    if (expiry_date !== undefined) updatePayload.expiry_date = expiry_date;

    if (isSupabaseConfigured) {
      // 1. Update header
      const subRes = await supabaseFetch(`subscriptions?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify(updatePayload),
      });
      if (!subRes.ok) throw new Error(await subRes.text());

      // 2. Replace lines if provided
      if (computedLines.length > 0) {
        await supabaseFetch(`subscription_lines?subscription_id=eq.${id}`, {
          method: "DELETE",
        });

        const linesRes = await supabaseFetch("subscription_lines", {
          method: "POST",
          body: JSON.stringify(computedLines),
        });
        if (!linesRes.ok) throw new Error(await linesRes.text());
      }

      return NextResponse.json({
        success: true,
        totals: { subtotal, discountTotal, taxTotal, grandTotal },
      });
    }

    // Local SQLite update
    const db = getLocalDb();
    db.run(
      `UPDATE subscriptions SET
        subtotal = ?, discount_total = ?, tax_total = ?, grand_total = ?,
        stage = COALESCE(?, stage),
        payment_terms = COALESCE(?, payment_terms),
        start_date = COALESCE(?, start_date),
        expiry_date = COALESCE(?, expiry_date)
       WHERE id = ?`,
      [
        subtotal,
        discountTotal,
        taxTotal,
        grandTotal,
        stage || null,
        payment_terms || null,
        start_date || null,
        expiry_date || null,
        id,
      ]
    );

    if (computedLines.length > 0) {
      db.run("DELETE FROM subscription_lines WHERE subscription_id = ?", [id]);
      const insertLine = db.prepare(`
        INSERT INTO subscription_lines (
          id, subscription_id, product_id, variant_id, quantity, unit_price, tax_amount, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const line of computedLines) {
        insertLine.run(
          line.id,
          line.subscription_id,
          line.product_id,
          line.variant_id,
          line.quantity,
          line.unit_price,
          line.tax_amount,
          line.line_total
        );
      }
    }

    return NextResponse.json({
      success: true,
      totals: { subtotal, discountTotal, taxTotal, grandTotal },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (isSupabaseConfigured) {
      const res = await supabaseFetch(`subscriptions?id=eq.${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return NextResponse.json({ success: true });
    }

    const db = getLocalDb();
    db.run("DELETE FROM subscriptions WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
