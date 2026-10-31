import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";
import { randomUUID } from "node:crypto";

function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

// compute due date based on agreed payment terms
function computeDueDate(terms: string, fromDate = new Date()): string {
  const lower = (terms || "").toLowerCase();
  if (lower.includes("15")) {
    return addDays(fromDate, 15);
  }
  if (lower.includes("30")) {
    return addDays(fromDate, 30);
  }
  return fromDate.toISOString().slice(0, 10);
}

// prevent duplicate billing within same renewal window
function hasActiveInvoiceInPeriod(invoices: any[], interval: string): boolean {
  if (!invoices || invoices.length === 0) return false;

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = String(now.getUTCMonth() + 1).padStart(2, "0");
  const currentMonthPrefix = `${currentYear}-${currentMonth}`;
  const todayStr = now.toISOString().slice(0, 10);

  return invoices.some((inv: any) => {
    if (inv.status === "CANCELLED") return false;
    const invDateStr = inv.created_at || inv.due_date;
    if (!invDateStr) return false;

    const invDate = new Date(invDateStr);
    const diffDays = Math.abs((now.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24));

    switch (interval.toUpperCase()) {
      case "DAILY":
        return invDateStr.startsWith(todayStr);
      case "WEEKLY":
        return diffDays < 6;
      case "MONTHLY":
        return invDateStr.startsWith(currentMonthPrefix) || diffDays < 25;
      case "YEARLY":
        return invDate.getUTCFullYear() === currentYear || diffDays < 300;
      default:
        return diffDays < 25;
    }
  });
}

export async function POST() {
  try {
    const now = new Date();
    const createdInvoices: any[] = [];
    let skippedCount = 0;

    if (isSupabaseConfigured) {
      // 1. Fetch active subscriptions with invoices and plan intervals
      const subRes = await supabaseFetch(
        "subscriptions?select=*,plan:plans(billing_interval),customer:profiles(name,email),invoices(*)&stage=eq.ACTIVE"
      );
      const activeSubs = await subRes.json();

      if (!Array.isArray(activeSubs) || activeSubs.length === 0) {
        return NextResponse.json({
          success: true,
          created_count: 0,
          skipped_count: 0,
          created_invoices: [],
          message: "Billing run complete: No active subscriptions require billing.",
        });
      }

      for (const sub of activeSubs) {
        const interval = sub.plan?.billing_interval || "MONTHLY";
        const alreadyBilled = hasActiveInvoiceInPeriod(sub.invoices || [], interval);

        if (alreadyBilled) {
          skippedCount++;
          continue;
        }

        const invoiceId = randomUUID();
        const randSeq = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${now.getUTCFullYear()}-${randSeq}`;
        const dueDate = computeDueDate(sub.payment_terms, now);

        const newInvoicePayload = {
          id: invoiceId,
          invoice_number: invoiceNumber,
          subscription_id: sub.id,
          customer_id: sub.customer_id,
          status: "DRAFT",
          subtotal: Number(sub.subtotal || 0),
          tax_amount: Number(sub.tax_total || 0),
          discount_amount: Number(sub.discount_total || 0),
          total_amount: Number(sub.grand_total || 0),
          due_date: dueDate,
        };

        const insertRes = await supabaseFetch("invoices", {
          method: "POST",
          body: JSON.stringify(newInvoicePayload),
        });

        if (insertRes.ok) {
          createdInvoices.push({
            id: invoiceId,
            invoice_number: invoiceNumber,
            subscription_ref: sub.sub_number,
            customer_name: sub.customer?.name,
            total_amount: Number(sub.grand_total || 0),
            due_date: dueDate,
          });
        }
      }

      return NextResponse.json({
        success: true,
        created_count: createdInvoices.length,
        skipped_count: skippedCount,
        created_invoices: createdInvoices,
        message: `Billing run complete: ${createdInvoices.length} invoice${createdInvoices.length === 1 ? "" : "s"} created, ${skippedCount} skipped (already billed).`,
      });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    const activeSubs = db.query(`
      SELECT s.*, pl.billing_interval, pr.name as customer_name
      FROM subscriptions s
      JOIN plans pl ON s.plan_id = pl.id
      JOIN profiles pr ON s.customer_id = pr.id
      WHERE s.stage = 'ACTIVE'
    `).all() as any[];

    for (const sub of activeSubs) {
      const existingInvoices = db.query(
        `SELECT * FROM invoices WHERE subscription_id = '${sub.id}'`
      ).all() as any[];

      const interval = sub.billing_interval || "MONTHLY";
      if (hasActiveInvoiceInPeriod(existingInvoices, interval)) {
        skippedCount++;
        continue;
      }

      const invoiceId = randomUUID();
      const randSeq = Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `INV-${now.getUTCFullYear()}-${randSeq}`;
      const dueDate = computeDueDate(sub.payment_terms, now);

      db.run(
        `INSERT INTO invoices (id, invoice_number, subscription_id, customer_id, status, subtotal, tax_amount, discount_amount, total_amount, due_date)
         VALUES (?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?)`,
        [
          invoiceId,
          invoiceNumber,
          sub.id,
          sub.customer_id,
          sub.subtotal,
          sub.tax_total,
          sub.discount_total,
          sub.grand_total,
          dueDate,
        ]
      );

      createdInvoices.push({
        id: invoiceId,
        invoice_number: invoiceNumber,
        subscription_ref: sub.sub_number,
        customer_name: sub.customer_name,
        total_amount: Number(sub.grand_total),
        due_date: dueDate,
      });
    }

    return NextResponse.json({
      success: true,
      created_count: createdInvoices.length,
      skipped_count: skippedCount,
      created_invoices: createdInvoices,
      message: `Billing run complete: ${createdInvoices.length} invoice${createdInvoices.length === 1 ? "" : "s"} created, ${skippedCount} skipped (already billed).`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
