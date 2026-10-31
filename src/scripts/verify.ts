/**
 * Outloop / Brightloop Subscriptions
 * Rigorous Schema & Seed Verification Script
 * Odoo x Make-A-Ton 9.0 Hackathon
 */

import { getDb } from "../lib/db";

interface TableCount {
  table: string;
  count: number;
  expected: number;
  status: "PASS" | "FAIL";
}

export async function runVerification(options?: { inMemory?: boolean; dbPath?: string }) {
  console.log("==================================================================");
  console.log("🔍 OUTLOOP BILLING ENGINE: RIGOROUS DATA & SCHEMA AUDIT");
  console.log("==================================================================");

  const db = getDb(options);

  // 1. Audit Table Row Counts
  const expectedCounts: Record<string, number> = {
    profiles: 3,
    products: 3,
    product_variants: 1,
    plans: 3,
    discounts: 2,
    subscriptions: 6,
    subscription_lines: 9,
    invoices: 5,
    payments: 2,
  };

  const results: TableCount[] = [];
  let allCountsPass = true;

  console.log("\n📊 Step 1: Record Count Verification");
  console.log("------------------------------------------------------------------");

  for (const [table, expected] of Object.entries(expectedCounts)) {
    const row = db.query(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
    const count = Number(row.count);
    const pass = count === expected;
    if (!pass) allCountsPass = false;

    results.push({
      table,
      count,
      expected,
      status: pass ? "PASS" : "FAIL",
    });

    console.log(
      `  • ${table.padEnd(20)} : ${count} rows (Expected: ${expected}) [${pass ? "✅ PASS" : "❌ FAIL"}]`
    );
  }

  // 2. Audit Foreign Key Integrity
  console.log("\n🔗 Step 2: Relational Foreign Key Integrity Check");
  console.log("------------------------------------------------------------------");

  const fkCheck = db.query("PRAGMA foreign_key_check;").all();
  if (fkCheck.length === 0) {
    console.log("  ✅ Zero foreign key violations detected across all 9 relational entities.");
  } else {
    console.error("  ❌ FOREIGN KEY VIOLATIONS DETECTED:", fkCheck);
    throw new Error("Foreign key check failed!");
  }

  // 3. Audit Specific Entity Assertions
  console.log("\n🧪 Step 3: Entity Specific Relational Linkage Audits");
  console.log("------------------------------------------------------------------");

  // A. Profiles check
  const personas = db.query("SELECT role, count(*) as c FROM profiles GROUP BY role").all() as { role: string; c: number }[];
  console.log("  • Profiles breakdown:", personas.map(p => `${p.role}: ${p.c}`).join(", "));

  // B. Product Variants check
  const variantJoin = db.query(`
    SELECT p.name, pv.variant_name, p.sales_price, pv.extra_price, (p.sales_price + pv.extra_price) as total_price
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
  `).all() as any[];
  console.log(`  • Variant Join: "${variantJoin[0]?.name}" + "${variantJoin[0]?.variant_name}" = $${variantJoin[0]?.total_price} (Base $${variantJoin[0]?.sales_price} + Extra $${variantJoin[0]?.extra_price})`);

  // C. Subscription Stages Check
  const subStages = db.query("SELECT stage, sub_number, grand_total FROM subscriptions ORDER BY sub_number").all() as any[];
  console.log("  • Subscriptions by Stage:");
  for (const s of subStages) {
    console.log(`    - [${s.stage.padEnd(9)}] ${s.sub_number}: Grand Total $${s.grand_total.toFixed(2)}`);
  }

  // D. Invoices Check
  const invList = db.query(`
    SELECT i.invoice_number, i.status, i.total_amount, i.due_date,
           p.amount as paid_amount, p.payment_method
    FROM invoices i
    LEFT JOIN payments p ON p.invoice_id = i.id
    ORDER BY i.invoice_number
  `).all() as any[];

  console.log("  • Invoices Audit:");
  for (const inv of invList) {
    const paymentInfo = inv.paid_amount ? `(Paid $${inv.paid_amount.toFixed(2)} via ${inv.payment_method})` : "(Unpaid)";
    console.log(`    - [${inv.status.padEnd(9)}] ${inv.invoice_number}: $${inv.total_amount.toFixed(2)} Due: ${inv.due_date} ${paymentInfo}`);
  }

  // 4. Test Cascade Integrity in a Dry-Run Transaction
  console.log("\n🛡️ Step 4: Foreign Key Cascade Behavior Audit");
  console.log("------------------------------------------------------------------");
  db.run("BEGIN TRANSACTION;");
  try {
    // Insert a transient subscription with 2 lines
    const testSubId = "99999999-9999-4999-a999-999999999999";
    db.run(`
      INSERT INTO subscriptions (id, sub_number, customer_id, plan_id, stage, subtotal, grand_total)
      VALUES ('${testSubId}', 'SUB-TEST-CASCADE', '33333333-3333-4333-a333-333333333333', 'c0000000-0000-4000-8000-000000000001', 'DRAFT', 100, 100)
    `);
    db.run(`
      INSERT INTO subscription_lines (id, subscription_id, product_id, quantity, unit_price, line_total)
      VALUES ('99999999-9999-4999-a999-999999999991', '${testSubId}', 'a0000000-0000-4000-8000-000000000001', 1, 100, 100)
    `);

    // Verify insertion
    const lineCountBefore = (db.query(`SELECT count(*) as c FROM subscription_lines WHERE subscription_id = '${testSubId}'`).get() as any).c;
    // Delete parent subscription
    db.run(`DELETE FROM subscriptions WHERE id = '${testSubId}'`);
    // Verify lines were cascaded
    const lineCountAfter = (db.query(`SELECT count(*) as c FROM subscription_lines WHERE subscription_id = '${testSubId}'`).get() as any).c;

    if (lineCountBefore === 1 && lineCountAfter === 0) {
      console.log("  ✅ ON DELETE CASCADE confirmed: Parent deletion cleanly purges child subscription_lines.");
    } else {
      throw new Error(`Cascade test failed: lineCountBefore=${lineCountBefore}, lineCountAfter=${lineCountAfter}`);
    }
  } finally {
    db.run("ROLLBACK;"); // Roll back test records
  }

  console.log("\n==================================================================");
  if (allCountsPass) {
    console.log("🎉 ALL AUDITS & VERIFICATIONS PASSED WITH ZERO ERRORS!");
  } else {
    console.error("❌ VERIFICATION AUDIT FOUND DISCREPANCIES!");
    process.exit(1);
  }
  console.log("==================================================================\n");

  return results;
}

if (import.meta.main) {
  runVerification()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Verification failed:", err);
      process.exit(1);
    });
}
