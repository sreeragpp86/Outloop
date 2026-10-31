import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const todayStr = new Date().toISOString().slice(0, 10);

    if (isSupabaseConfigured) {
      const res = await supabaseFetch(
        `invoices?select=*,customer:profiles(*),subscription:subscriptions(*,plan:plans(*),discount:discounts(*),lines:subscription_lines(*,product:products(*),variant:product_variants(*))),payments(*)&id=eq.${id}`
      );
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      const inv = data[0];
      const payments = (inv.payments || []).sort(
        (a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      );
      const paidAmount = payments.reduce(
        (acc: number, p: any) => acc + Number(p.amount || 0),
        0
      );
      const totalAmount = Number(inv.total_amount || 0);
      const balanceDue = Math.max(0, Number((totalAmount - paidAmount).toFixed(2)));
      const isOverdue = inv.status === "CONFIRMED" && inv.due_date < todayStr;

      return NextResponse.json({
        ...inv,
        subtotal: Number(inv.subtotal),
        tax_amount: Number(inv.tax_amount),
        discount_amount: Number(inv.discount_amount),
        total_amount: totalAmount,
        paid_amount: Number(paidAmount.toFixed(2)),
        balance_due: balanceDue,
        is_overdue: isOverdue,
        payments,
      });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    const row = db.query(`
      SELECT i.*,
        json_object('id', pr.id, 'name', pr.name, 'email', pr.email, 'role', pr.role) as customer,
        CASE WHEN s.id IS NOT NULL THEN
          json_object(
            'id', s.id,
            'sub_number', s.sub_number,
            'stage', s.stage,
            'start_date', s.start_date,
            'expiry_date', s.expiry_date,
            'payment_terms', s.payment_terms
          )
        ELSE NULL END as subscription
      FROM invoices i
      JOIN profiles pr ON i.customer_id = pr.id
      LEFT JOIN subscriptions s ON i.subscription_id = s.id
      WHERE i.id = '${id}'
    `).get();

    if (!row) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const payments = db.query(`SELECT * FROM payments WHERE invoice_id = '${id}' ORDER BY payment_date DESC`).all();
    const paidAmount = payments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
    const totalAmount = Number(row.total_amount || 0);

    return NextResponse.json({
      ...row,
      customer: JSON.parse(row.customer),
      subscription: row.subscription ? JSON.parse(row.subscription) : null,
      payments,
      paid_amount: Number(paidAmount.toFixed(2)),
      balance_due: Math.max(0, Number((totalAmount - paidAmount).toFixed(2))),
      is_overdue: row.status === "CONFIRMED" && row.due_date < todayStr,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["DRAFT", "CONFIRMED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid target invoice status" }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      // fetch current status to prevent cancelling paid invoices
      const checkRes = await supabaseFetch(`invoices?select=status&id=eq.${id}`);
      const checkData = await checkRes.json();
      if (!Array.isArray(checkData) || checkData.length === 0) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      if (checkData[0].status === "PAID") {
        return NextResponse.json(
          { error: "Paid invoices cannot be modified directly" },
          { status: 400 }
        );
      }

      const updateRes = await supabaseFetch(`invoices?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        return NextResponse.json({ error: err.message || "Failed to update invoice status" }, { status: 500 });
      }

      return NextResponse.json({ success: true, status });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    const current = db.query(`SELECT status FROM invoices WHERE id = '${id}'`).get() as any;
    if (!current) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (current.status === "PAID") {
      return NextResponse.json({ error: "Paid invoices cannot be modified directly" }, { status: 400 });
    }

    db.run(`UPDATE invoices SET status = '${status}' WHERE id = '${id}'`);
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
