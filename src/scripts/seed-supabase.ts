import { isSupabaseConfigured, supabaseFetch } from "../lib/server-db";

async function seedSupabase() {
  console.log("Seeding Supabase...");

  // 1. Clean existing in reverse order
  const tables = [
    "payments",
    "invoices",
    "subscription_lines",
    "subscriptions",
    "discounts",
    "plans",
    "product_variants",
    "products",
    "profiles",
  ];

  for (const table of tables) {
    const res = await supabaseFetch(`${table}?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    console.log(`Cleared ${table}: ${res.status}`);
  }

  // 2. Insert Profiles
  const profiles = [
    { id: "11111111-1111-4111-a111-111111111111", name: "Sarah Connor", email: "admin@brightloop.io", role: "ADMIN", created_at: "2025-10-01T08:00:00Z" },
    { id: "22222222-2222-4222-a222-222222222222", name: "Alex Rivera", email: "staff@brightloop.io", role: "STAFF", created_at: "2025-10-05T09:30:00Z" },
    { id: "33333333-3333-4333-a333-333333333333", name: "Acme Corp / Liam Patel", email: "liam@acme.com", role: "CUSTOMER", created_at: "2025-10-10T14:15:00Z" },
    { id: "44444444-4444-4444-a444-444444444444", name: "Nexura Logistics / Marcus Chen", email: "ops@nexura.io", role: "CUSTOMER", created_at: "2025-10-12T10:00:00Z" },
    { id: "55555555-5555-4555-a555-555555555555", name: "Starlight Media / Maya Lin", email: "finance@starlight.co", role: "CUSTOMER", created_at: "2025-10-15T11:30:00Z" },
  ];
  let res = await supabaseFetch("profiles", { method: "POST", body: JSON.stringify(profiles) });
  console.log("Profiles inserted:", res.status);

  // 3. Products
  const products = [
    { id: "a0000000-0000-4000-8000-000000000001", name: "Brightloop Core Cloud", product_type: "SERVICE", sales_price: 120.00, cost_price: 30.00, tax_rate: 18.00, notes: "Dedicated high-availability multi-tenant cloud subscription", created_at: "2025-10-01T08:00:00Z" },
    { id: "a0000000-0000-4000-8000-000000000002", name: "Field Operations Module", product_type: "SERVICE", sales_price: 85.00, cost_price: 20.00, tax_rate: 18.00, notes: "Real-time telemetry and dispatched workforce tracking", created_at: "2025-10-01T08:00:00Z" },
    { id: "a0000000-0000-4000-8000-000000000003", name: "Enterprise ERP Connector", product_type: "SERVICE", sales_price: 250.00, cost_price: 60.00, tax_rate: 18.00, notes: "Bidirectional ERP synchronization gateway with custom schema mapping", created_at: "2025-10-01T08:00:00Z" },
  ];
  res = await supabaseFetch("products", { method: "POST", body: JSON.stringify(products) });
  console.log("Products inserted:", res.status);

  // 4. Product Variants
  const variants = [
    { id: "b0000000-0000-4000-8000-000000000001", product_id: "a0000000-0000-4000-8000-000000000003", variant_name: "Brand: Odoo", extra_price: 560.00, created_at: "2025-10-01T08:00:00Z" },
  ];
  res = await supabaseFetch("product_variants", { method: "POST", body: JSON.stringify(variants) });
  console.log("Variants inserted:", res.status);

  // 5. Plans
  const plans = [
    { id: "c0000000-0000-4000-8000-000000000001", name: "Starter Monthly", billing_interval: "MONTHLY", min_quantity: 1, start_date: "2025-01-01", end_date: null, auto_close_on_end: false, can_pause: true, can_renew: true, created_at: "2025-10-01T08:00:00Z" },
    { id: "c0000000-0000-4000-8000-000000000002", name: "Growth Yearly", billing_interval: "YEARLY", min_quantity: 5, start_date: "2025-01-01", end_date: null, auto_close_on_end: false, can_pause: true, can_renew: true, created_at: "2025-10-01T08:00:00Z" },
    { id: "c0000000-0000-4000-8000-000000000003", name: "Enterprise Scale", billing_interval: "YEARLY", min_quantity: 10, start_date: "2025-01-01", end_date: null, auto_close_on_end: false, can_pause: true, can_renew: true, created_at: "2025-10-01T08:00:00Z" },
  ];
  res = await supabaseFetch("plans", { method: "POST", body: JSON.stringify(plans) });
  console.log("Plans inserted:", res.status);

  // 6. Discounts
  const discounts = [
    { id: "d0000000-0000-4000-8000-000000000001", code: "BULK10", discount_type: "PERCENTAGE", value: 10.00, min_quantity: 5, min_amount: 0.00, max_uses: 500, used_count: 1, start_date: "2025-01-01", end_date: "2027-12-31", is_active: true, created_at: "2025-10-01T08:00:00Z" },
    { id: "d0000000-0000-4000-8000-000000000002", code: "SCALE500", discount_type: "FIXED", value: 500.00, min_quantity: 0, min_amount: 2000.00, max_uses: 100, used_count: 1, start_date: "2025-01-01", end_date: "2027-12-31", is_active: true, created_at: "2025-10-01T08:00:00Z" },
  ];
  res = await supabaseFetch("discounts", { method: "POST", body: JSON.stringify(discounts) });
  console.log("Discounts inserted:", res.status);

  // 7. Subscriptions
  const subscriptions = [
    { id: "e0000000-0000-4000-8000-000000000001", sub_number: "SUB-2026-001", customer_id: "33333333-3333-4333-a333-333333333333", plan_id: "c0000000-0000-4000-8000-000000000002", discount_id: "d0000000-0000-4000-8000-000000000001", stage: "ACTIVE", start_date: "2026-01-01", expiry_date: "2026-12-31", payment_terms: "Immediate Payment", subtotal: 1410.00, tax_total: 228.42, discount_total: 141.00, grand_total: 1497.42, created_at: "2026-01-01T09:00:00Z" },
    { id: "e0000000-0000-4000-8000-000000000002", sub_number: "SUB-2026-002", customer_id: "44444444-4444-4444-a444-444444444444", plan_id: "c0000000-0000-4000-8000-000000000001", discount_id: null, stage: "PAUSED", start_date: "2026-02-01", expiry_date: "2026-08-01", payment_terms: "15 Days", subtotal: 170.00, tax_total: 30.60, discount_total: 0.00, grand_total: 200.60, created_at: "2026-02-01T10:00:00Z" },
    { id: "e0000000-0000-4000-8000-000000000003", sub_number: "SUB-2026-003", customer_id: "55555555-5555-4555-a555-555555555555", plan_id: "c0000000-0000-4000-8000-000000000003", discount_id: "d0000000-0000-4000-8000-000000000002", stage: "CONFIRMED", start_date: "2026-11-01", expiry_date: "2027-10-31", payment_terms: "30 Days Net", subtotal: 2820.00, tax_total: 417.60, discount_total: 500.00, grand_total: 2737.60, created_at: "2026-10-25T11:00:00Z" },
    { id: "e0000000-0000-4000-8000-000000000004", sub_number: "SUB-2026-004", customer_id: "44444444-4444-4444-a444-444444444444", plan_id: "c0000000-0000-4000-8000-000000000001", discount_id: null, stage: "QUOTATION", start_date: "2026-11-01", expiry_date: "2027-04-30", payment_terms: "Immediate Payment", subtotal: 205.00, tax_total: 36.90, discount_total: 0.00, grand_total: 241.90, created_at: "2026-10-28T14:30:00Z" },
    { id: "e0000000-0000-4000-8000-000000000005", sub_number: "SUB-2026-005", customer_id: "55555555-5555-4555-a555-555555555555", plan_id: "c0000000-0000-4000-8000-000000000001", discount_id: null, stage: "DRAFT", start_date: "2026-11-15", expiry_date: "2027-05-15", payment_terms: "Immediate Payment", subtotal: 255.00, tax_total: 45.90, discount_total: 0.00, grand_total: 300.90, created_at: "2026-10-30T16:00:00Z" },
    { id: "e0000000-0000-4000-8000-000000000006", sub_number: "SUB-2026-006", customer_id: "33333333-3333-4333-a333-333333333333", plan_id: "c0000000-0000-4000-8000-000000000002", discount_id: null, stage: "CLOSED", start_date: "2024-10-01", expiry_date: "2025-09-30", payment_terms: "Immediate Payment", subtotal: 600.00, tax_total: 108.00, discount_total: 0.00, grand_total: 708.00, created_at: "2024-10-01T09:00:00Z" },
  ];
  res = await supabaseFetch("subscriptions", { method: "POST", body: JSON.stringify(subscriptions) });
  console.log("Subscriptions inserted:", res.status);

  // 8. Subscription Lines
  const lines = [
    { id: "80000000-0000-4000-8000-000000000001", subscription_id: "e0000000-0000-4000-8000-000000000001", product_id: "a0000000-0000-4000-8000-000000000001", variant_id: null, quantity: 5, unit_price: 120.00, tax_amount: 108.00, line_total: 600.00, created_at: "2026-01-01T09:00:00Z" },
    { id: "80000000-0000-4000-8000-000000000002", subscription_id: "e0000000-0000-4000-8000-000000000001", product_id: "a0000000-0000-4000-8000-000000000003", variant_id: "b0000000-0000-4000-8000-000000000001", quantity: 1, unit_price: 810.00, tax_amount: 145.80, line_total: 810.00, created_at: "2026-01-01T09:00:00Z" },
    { id: "80000000-0000-4000-8000-000000000003", subscription_id: "e0000000-0000-4000-8000-000000000002", product_id: "a0000000-0000-4000-8000-000000000002", variant_id: null, quantity: 2, unit_price: 85.00, tax_amount: 30.60, line_total: 170.00, created_at: "2026-02-01T10:00:00Z" },
    { id: "80000000-0000-4000-8000-000000000004", subscription_id: "e0000000-0000-4000-8000-000000000003", product_id: "a0000000-0000-4000-8000-000000000001", variant_id: null, quantity: 10, unit_price: 120.00, tax_amount: 216.00, line_total: 1200.00, created_at: "2026-10-25T11:00:00Z" },
    { id: "80000000-0000-4000-8000-000000000005", subscription_id: "e0000000-0000-4000-8000-000000000003", product_id: "a0000000-0000-4000-8000-000000000003", variant_id: "b0000000-0000-4000-8000-000000000001", quantity: 2, unit_price: 810.00, tax_amount: 291.60, line_total: 1620.00, created_at: "2026-10-25T11:00:00Z" },
    { id: "80000000-0000-4000-8000-000000000006", subscription_id: "e0000000-0000-4000-8000-000000000004", product_id: "a0000000-0000-4000-8000-000000000001", variant_id: null, quantity: 1, unit_price: 120.00, tax_amount: 21.60, line_total: 120.00, created_at: "2026-10-28T14:30:00Z" },
    { id: "80000000-0000-4000-8000-000000000007", subscription_id: "e0000000-0000-4000-8000-000000000004", product_id: "a0000000-0000-4000-8000-000000000002", variant_id: null, quantity: 1, unit_price: 85.00, tax_amount: 15.30, line_total: 85.00, created_at: "2026-10-28T14:30:00Z" },
    { id: "80000000-0000-4000-8000-000000000008", subscription_id: "e0000000-0000-4000-8000-000000000005", product_id: "a0000000-0000-4000-8000-000000000002", variant_id: null, quantity: 3, unit_price: 85.00, tax_amount: 45.90, line_total: 255.00, created_at: "2026-10-30T16:00:00Z" },
    { id: "80000000-0000-4000-8000-000000000009", subscription_id: "e0000000-0000-4000-8000-000000000006", product_id: "a0000000-0000-4000-8000-000000000001", variant_id: null, quantity: 5, unit_price: 120.00, tax_amount: 108.00, line_total: 600.00, created_at: "2024-10-01T09:00:00Z" },
  ];
  res = await supabaseFetch("subscription_lines", { method: "POST", body: JSON.stringify(lines) });
  console.log("Lines inserted:", res.status);

  // 9. Invoices
  const invoices = [
    { id: "f0000000-0000-4000-8000-000000000001", invoice_number: "INV-2026-001", subscription_id: "e0000000-0000-4000-8000-000000000001", customer_id: "33333333-3333-4333-a333-333333333333", status: "PAID", subtotal: 1410.00, tax_amount: 228.42, discount_amount: 141.00, total_amount: 1497.42, due_date: "2026-01-15", paid_at: "2026-01-14T10:30:00Z", created_at: "2026-01-01T09:05:00Z" },
    { id: "f0000000-0000-4000-8000-000000000002", invoice_number: "INV-2026-002", subscription_id: "e0000000-0000-4000-8000-000000000006", customer_id: "33333333-3333-4333-a333-333333333333", status: "PAID", subtotal: 600.00, tax_amount: 108.00, discount_amount: 0.00, total_amount: 708.00, due_date: "2025-10-01", paid_at: "2025-09-30T14:15:00Z", created_at: "2024-10-01T09:05:00Z" },
    { id: "f0000000-0000-4000-8000-000000000003", invoice_number: "INV-2026-003", subscription_id: "e0000000-0000-4000-8000-000000000002", customer_id: "44444444-4444-4444-a444-444444444444", status: "CONFIRMED", subtotal: 170.00, tax_amount: 30.60, discount_amount: 0.00, total_amount: 200.60, due_date: "2026-10-15", paid_at: null, created_at: "2026-10-01T10:00:00Z" },
    { id: "f0000000-0000-4000-8000-000000000004", invoice_number: "INV-2026-004", subscription_id: "e0000000-0000-4000-8000-000000000003", customer_id: "55555555-5555-4555-a555-555555555555", status: "CONFIRMED", subtotal: 2820.00, tax_amount: 417.60, discount_amount: 500.00, total_amount: 2737.60, due_date: "2026-11-15", paid_at: null, created_at: "2026-10-25T11:15:00Z" },
    { id: "f0000000-0000-4000-8000-000000000005", invoice_number: "INV-2026-005", subscription_id: "e0000000-0000-4000-8000-000000000004", customer_id: "44444444-4444-4444-a444-444444444444", status: "DRAFT", subtotal: 205.00, tax_amount: 36.90, discount_amount: 0.00, total_amount: 241.90, due_date: "2026-11-30", paid_at: null, created_at: "2026-10-28T14:45:00Z" },
  ];
  res = await supabaseFetch("invoices", { method: "POST", body: JSON.stringify(invoices) });
  console.log("Invoices inserted:", res.status);

  // 10. Payments
  const payments = [
    { id: "90000000-0000-4000-8000-000000000001", invoice_id: "f0000000-0000-4000-8000-000000000001", amount: 1497.42, payment_method: "Credit Card", payment_date: "2026-01-14", notes: "Stripe Corporate Visa ending 4242 - Auth #981240", created_at: "2026-01-14T10:30:00Z" },
    { id: "90000000-0000-4000-8000-000000000002", invoice_id: "f0000000-0000-4000-8000-000000000002", amount: 708.00, payment_method: "Bank Transfer", payment_date: "2025-09-30", notes: "Wire Settlement Ref #WT-98231ACH - JPMorgan Chase", created_at: "2025-09-30T14:15:00Z" },
  ];
  res = await supabaseFetch("payments", { method: "POST", body: JSON.stringify(payments) });
  console.log("Payments inserted:", res.status);

  console.log("🎉 Supabase successfully seeded with all 5 profiles, variant Brand: Odoo, and customer relationships!");
}

seedSupabase().catch(console.error);
