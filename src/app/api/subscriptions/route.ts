import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";
import { randomUUID } from "node:crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");

    if (isSupabaseConfigured) {
      let query = "subscriptions?select=*,customer:profiles(*),plan:plans(*),discount:discounts(*),lines:subscription_lines(*,product:products(*),variant:product_variants(*))&order=created_at.desc";
      if (stage && stage !== "ALL") {
        query += `&stage=eq.${stage}`;
      }

      const res = await supabaseFetch(query);
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Local SQLite fallback
    const db = getLocalDb();
    let sql = `
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
    `;

    if (stage && stage !== "ALL") {
      sql += ` WHERE s.stage = '${stage}'`;
    }
    sql += ` ORDER BY s.created_at DESC`;

    const rows = db.query(sql).all().map((r: any) => ({
      ...r,
      customer: JSON.parse(r.customer),
      plan: JSON.parse(r.plan),
      discount: r.discount ? JSON.parse(r.discount) : null,
      lines: db.query(`
        SELECT sl.*,
          json_object('id', p.id, 'name', p.name, 'sales_price', p.sales_price, 'tax_rate', p.tax_rate) as product,
          CASE WHEN pv.id IS NOT NULL THEN
            json_object('id', pv.id, 'variant_name', pv.variant_name, 'extra_price', pv.extra_price)
          ELSE NULL END as variant
        FROM subscription_lines sl
        JOIN products p ON sl.product_id = p.id
        LEFT JOIN product_variants pv ON sl.variant_id = pv.id
        WHERE sl.subscription_id = '${r.id}'
      `).all().map((l: any) => ({
        ...l,
        product: JSON.parse(l.product),
        variant: l.variant ? JSON.parse(l.variant) : null,
      })),
    }));

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      plan_id,
      discount_code,
      payment_terms = "Immediate Payment",
      start_date = new Date().toISOString().split("T")[0],
      expiry_date,
      lines = [],
      stage = "DRAFT",
    } = body;

    if (!customer_id || !plan_id) {
      return NextResponse.json(
        { error: "Customer and Plan are required" },
        { status: 400 }
      );
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json(
        { error: "At least one product line item is required" },
        { status: 400 }
      );
    }

    const subId = randomUUID();
    const year = new Date().getFullYear();
    const subNumber = `SUB-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Calculate line item totals
    let subtotal = 0;
    let totalQty = 0;
    const computedLines = lines.map((line: any) => {
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
        id: randomUUID(),
        subscription_id: subId,
        product_id: line.product_id,
        variant_id: line.variant_id || null,
        quantity: qty,
        unit_price: unitPrice,
        tax_amount: taxAmount,
        line_total: lineTotal,
      };
    });

    subtotal = Number(subtotal.toFixed(2));

    // 2. Validate & apply discount rules if provided
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

    if (isSupabaseConfigured) {
      // Insert subscription header
      const subPayload = {
        id: subId,
        sub_number: subNumber,
        customer_id,
        plan_id,
        discount_id: discountId,
        stage,
        start_date,
        expiry_date: expiry_date || null,
        payment_terms,
        subtotal,
        discount_total: discountTotal,
        tax_total: taxTotal,
        grand_total: grandTotal,
      };

      const createSubRes = await supabaseFetch("subscriptions", {
        method: "POST",
        body: JSON.stringify(subPayload),
      });

      if (!createSubRes.ok) {
        const errText = await createSubRes.text();
        throw new Error(`Failed to create subscription: ${errText}`);
      }

      // Insert line items
      const createLinesRes = await supabaseFetch("subscription_lines", {
        method: "POST",
        body: JSON.stringify(computedLines),
      });

      if (!createLinesRes.ok) {
        const errText = await createLinesRes.text();
        throw new Error(`Failed to create lines: ${errText}`);
      }

      return NextResponse.json({
        id: subId,
        sub_number: subNumber,
        grand_total: grandTotal,
        message: "Subscription created successfully",
      });
    }

    // Local SQLite insert
    const db = getLocalDb();
    const insertSub = db.prepare(`
      INSERT INTO subscriptions (
        id, sub_number, customer_id, plan_id, discount_id, stage,
        start_date, expiry_date, payment_terms, subtotal, discount_total, tax_total, grand_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertSub.run(
      subId,
      subNumber,
      customer_id,
      plan_id,
      discountId,
      stage,
      start_date,
      expiry_date || null,
      payment_terms,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal
    );

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

    return NextResponse.json({
      id: subId,
      sub_number: subNumber,
      grand_total: grandTotal,
      message: "Subscription created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
