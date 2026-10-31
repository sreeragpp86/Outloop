import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customer_id");

    const todayStr = new Date().toISOString().slice(0, 10);

    if (isSupabaseConfigured) {
      let query = "invoices?select=*,customer:profiles(*),subscription:subscriptions(sub_number,stage,payment_terms,plan:plans(name,billing_interval)),payments(*)&order=created_at.desc";

      if (customerId) {
        query += `&customer_id=eq.${customerId}`;
      }

      if (status && !["ALL", "OVERDUE"].includes(status)) {
        query += `&status=eq.${status}`;
      }

      const res = await supabaseFetch(query);
      const data = await res.json();

      if (!Array.isArray(data)) {
        return NextResponse.json({ invoices: [] });
      }

      const formatted = data.map((inv: any) => {
        const paymentsList = inv.payments || [];
        const paidAmount = paymentsList.reduce(
          (acc: number, p: any) => acc + Number(p.amount || 0),
          0
        );
        const totalAmount = Number(inv.total_amount || 0);
        const balanceDue = Math.max(0, Number((totalAmount - paidAmount).toFixed(2)));
        // check overdue condition against UTC date string
        const isOverdue = inv.status === "CONFIRMED" && inv.due_date < todayStr;

        return {
          ...inv,
          subtotal: Number(inv.subtotal),
          tax_amount: Number(inv.tax_amount),
          discount_amount: Number(inv.discount_amount),
          total_amount: totalAmount,
          paid_amount: Number(paidAmount.toFixed(2)),
          balance_due: balanceDue,
          is_overdue: isOverdue,
          subscription_ref: inv.subscription?.sub_number || null,
        };
      });

      const filtered = status === "OVERDUE"
        ? formatted.filter((inv: any) => inv.is_overdue)
        : formatted;

      return NextResponse.json({ invoices: filtered });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    let sql = `
      SELECT i.*,
        json_object('id', pr.id, 'name', pr.name, 'email', pr.email, 'role', pr.role) as customer,
        CASE WHEN s.id IS NOT NULL THEN
          json_object('sub_number', s.sub_number, 'stage', s.stage, 'payment_terms', s.payment_terms)
        ELSE NULL END as subscription
      FROM invoices i
      JOIN profiles pr ON i.customer_id = pr.id
      LEFT JOIN subscriptions s ON i.subscription_id = s.id
    `;

    const whereClauses: string[] = [];
    if (customerId) whereClauses.push(`i.customer_id = '${customerId}'`);
    if (status && !["ALL", "OVERDUE"].includes(status)) {
      whereClauses.push(`i.status = '${status}'`);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }
    sql += ` ORDER BY i.created_at DESC`;

    const rows = db.query(sql).all().map((r: any) => {
      const payments = db.query(`SELECT * FROM payments WHERE invoice_id = '${r.id}' ORDER BY payment_date DESC`).all();
      const paidAmount = payments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
      const totalAmount = Number(r.total_amount || 0);
      const isOverdue = r.status === "CONFIRMED" && r.due_date < todayStr;

      return {
        ...r,
        customer: JSON.parse(r.customer),
        subscription: r.subscription ? JSON.parse(r.subscription) : null,
        subscription_ref: r.subscription ? JSON.parse(r.subscription).sub_number : null,
        payments,
        subtotal: Number(r.subtotal),
        tax_amount: Number(r.tax_amount),
        discount_amount: Number(r.discount_amount),
        total_amount: totalAmount,
        paid_amount: Number(paidAmount.toFixed(2)),
        balance_due: Math.max(0, Number((totalAmount - paidAmount).toFixed(2))),
        is_overdue: isOverdue,
      };
    });

    const filtered = status === "OVERDUE"
      ? rows.filter((inv: any) => inv.is_overdue)
      : rows;

    return NextResponse.json({ invoices: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
