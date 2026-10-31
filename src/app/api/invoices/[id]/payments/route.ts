import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";
import { randomUUID } from "node:crypto";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, payment_method, payment_date, notes } = body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Payment amount must be greater than zero" }, { status: 400 });
    }

    if (!payment_method) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    }

    const payDate = payment_date || new Date().toISOString().split("T")[0];

    if (isSupabaseConfigured) {
      // fetch invoice to verify state and calculate remaining balance
      const invRes = await supabaseFetch(`invoices?select=id,status,total_amount,payments(amount)&id=eq.${id}`);
      const invData = await invRes.json();

      if (!Array.isArray(invData) || invData.length === 0) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      const inv = invData[0];
      if (inv.status === "CANCELLED") {
        return NextResponse.json({ error: "Cannot register payment on a cancelled invoice" }, { status: 400 });
      }

      const paymentId = randomUUID();
      const insertPayRes = await supabaseFetch("payments", {
        method: "POST",
        body: JSON.stringify({
          id: paymentId,
          invoice_id: id,
          amount: Number(parsedAmount.toFixed(2)),
          payment_method,
          payment_date: payDate,
          notes: notes || null,
        }),
      });

      if (!insertPayRes.ok) {
        const err = await insertPayRes.json();
        return NextResponse.json({ error: err.message || "Failed to save payment record" }, { status: 500 });
      }

      // calculate new settlement total
      const prevTotal = (inv.payments || []).reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
      const newTotalPaid = Number((prevTotal + parsedAmount).toFixed(2));
      const totalAmount = Number(inv.total_amount);
      const isSettled = newTotalPaid >= totalAmount;

      if (isSettled && inv.status !== "PAID") {
        await supabaseFetch(`invoices?id=eq.${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: "PAID",
            paid_at: new Date().toISOString(),
          }),
        });
      }

      return NextResponse.json({
        success: true,
        payment_id: paymentId,
        new_total_paid: newTotalPaid,
        balance_due: Math.max(0, Number((totalAmount - newTotalPaid).toFixed(2))),
        is_paid: isSettled,
      });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    const inv = db.query(`SELECT id, status, total_amount FROM invoices WHERE id = '${id}'`).get() as any;
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (inv.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot register payment on a cancelled invoice" }, { status: 400 });
    }

    const paymentId = randomUUID();
    db.run(
      `INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, id, parsedAmount, payment_method, payDate, notes || null]
    );

    const payments = db.query(`SELECT amount FROM payments WHERE invoice_id = '${id}'`).all() as any[];
    const newTotalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalAmount = Number(inv.total_amount);
    const isSettled = newTotalPaid >= totalAmount;

    if (isSettled && inv.status !== "PAID") {
      db.run(`UPDATE invoices SET status = 'PAID', paid_at = datetime('now') WHERE id = '${id}'`);
    }

    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      new_total_paid: newTotalPaid,
      balance_due: Math.max(0, Number((totalAmount - newTotalPaid).toFixed(2))),
      is_paid: isSettled,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
