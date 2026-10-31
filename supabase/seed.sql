-- ==============================================================================
-- Brightloop Subscriptions (Outloop) - Enterprise Production Seed Data
-- Brightloop Software Inc. - Enterprise Recurring Billing
-- ==============================================================================

-- Clean up any existing data in reverse dependency order
DELETE FROM payments;
DELETE FROM invoices;
DELETE FROM subscription_lines;
DELETE FROM subscriptions;
DELETE FROM discounts;
DELETE FROM plans;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM profiles;

-- ------------------------------------------------------------------------------
-- 1. PROFILES (3 Personas: Admin, Staff, Customer)
-- ------------------------------------------------------------------------------
INSERT INTO profiles (id, name, email, role, created_at) VALUES
('11111111-1111-4111-a111-111111111111', 'Sarah Connor', 'admin@brightloop.io', 'ADMIN', '2025-10-01T08:00:00Z'),
('22222222-2222-4222-a222-222222222222', 'Alex Rivera', 'staff@brightloop.io', 'STAFF', '2025-10-05T09:30:00Z'),
('33333333-3333-4333-a333-333333333333', 'Acme Corp / Liam Patel', 'liam@acme.com', 'CUSTOMER', '2025-10-10T14:15:00Z');

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS (3 Core Offerings)
-- ------------------------------------------------------------------------------
INSERT INTO products (id, name, product_type, sales_price, cost_price, tax_rate, notes, created_at) VALUES
('a0000000-0000-4000-8000-000000000001', 'Brightloop Core Cloud', 'SERVICE', 120.00, 30.00, 18.00, 'Dedicated high-availability multi-tenant cloud subscription', '2025-10-01T08:00:00Z'),
('a0000000-0000-4000-8000-000000000002', 'Field Operations Module', 'SERVICE', 85.00, 20.00, 18.00, 'Real-time telemetry and dispatched workforce tracking', '2025-10-01T08:00:00Z'),
('a0000000-0000-4000-8000-000000000003', 'Enterprise ERP Connector', 'SERVICE', 250.00, 60.00, 18.00, 'Bidirectional ERP synchronization gateway with custom schema mapping', '2025-10-01T08:00:00Z');

-- ------------------------------------------------------------------------------
-- 3. PRODUCT VARIANTS (Enterprise Edition Variant for Enterprise ERP Connector)
-- ------------------------------------------------------------------------------
INSERT INTO product_variants (id, product_id, variant_name, extra_price, created_at) VALUES
('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'Enterprise Edition', 560.00, '2025-10-01T08:00:00Z');

-- ------------------------------------------------------------------------------
-- 4. PLANS (3 Enterprise Recurring Cadences)
-- ------------------------------------------------------------------------------
INSERT INTO plans (id, name, billing_interval, min_quantity, start_date, end_date, auto_close_on_end, can_pause, can_renew, created_at) VALUES
('c0000000-0000-4000-8000-000000000001', 'Starter Monthly', 'MONTHLY', 1, '2025-01-01', NULL, FALSE, TRUE, TRUE, '2025-10-01T08:00:00Z'),
('c0000000-0000-4000-8000-000000000002', 'Growth Yearly', 'YEARLY', 5, '2025-01-01', NULL, FALSE, TRUE, TRUE, '2025-10-01T08:00:00Z'),
('c0000000-0000-4000-8000-000000000003', 'Enterprise Scale', 'YEARLY', 10, '2025-01-01', NULL, FALSE, TRUE, TRUE, '2025-10-01T08:00:00Z');

-- ------------------------------------------------------------------------------
-- 5. DISCOUNTS (2 Promotional & Tiered Discount Rules)
-- ------------------------------------------------------------------------------
INSERT INTO discounts (id, code, discount_type, value, min_quantity, min_amount, max_uses, used_count, start_date, end_date, is_active, created_at) VALUES
('d0000000-0000-4000-8000-000000000001', 'BULK10', 'PERCENTAGE', 10.00, 5, 0.00, 500, 1, '2025-01-01', '2027-12-31', TRUE, '2025-10-01T08:00:00Z'),
('d0000000-0000-4000-8000-000000000002', 'SCALE500', 'FIXED', 500.00, 0, 2000.00, 100, 1, '2025-01-01', '2027-12-31', TRUE, '2025-10-01T08:00:00Z');

-- ------------------------------------------------------------------------------
-- 6. SUBSCRIPTIONS (6 Subscriptions Across All 6 Stages)
-- ------------------------------------------------------------------------------
-- 1) ACTIVE: SUB-2026-001 (Growth Yearly + BULK10)
INSERT INTO subscriptions (id, sub_number, customer_id, plan_id, discount_id, stage, start_date, expiry_date, payment_terms, subtotal, tax_total, discount_total, grand_total, created_at) VALUES
('e0000000-0000-4000-8000-000000000001', 'SUB-2026-001', '33333333-3333-4333-a333-333333333333', 'c0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'ACTIVE', '2026-01-01', '2026-12-31', 'Immediate Payment', 1410.00, 228.42, 141.00, 1497.42, '2026-01-01T09:00:00Z');

-- 2) PAUSED: SUB-2026-002 (Starter Monthly)
INSERT INTO subscriptions (id, sub_number, customer_id, plan_id, discount_id, stage, start_date, expiry_date, payment_terms, subtotal, tax_total, discount_total, grand_total, created_at) VALUES
('e0000000-0000-4000-8000-000000000002', 'SUB-2026-002', '33333333-3333-4333-a333-333333333333', 'c0000000-0000-4000-8000-000000000001', NULL, 'PAUSED', '2026-02-01', '2026-08-01', '15 Days', 170.00, 30.60, 0.00, 200.60, '2026-02-01T10:00:00Z');

-- 3) CONFIRMED: SUB-2026-003 (Enterprise Scale + SCALE500)
INSERT INTO subscriptions (id, sub_number, customer_id, plan_id, discount_id, stage, start_date, expiry_date, payment_terms, subtotal, tax_total, discount_total, grand_total, created_at) VALUES
('e0000000-0000-4000-8000-000000000003', 'SUB-2026-003', '33333333-3333-4333-a333-333333333333', 'c0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000002', 'CONFIRMED', '2026-11-01', '2027-10-31', '30 Days Net', 2820.00, 417.60, 500.00, 2737.60, '2026-10-25T11:00:00Z');

-- 4) QUOTATION: SUB-2026-004 (Starter Monthly Proposal)
INSERT INTO subscriptions (id, sub_number, customer_id, plan_id, discount_id, stage, start_date, expiry_date, payment_terms, subtotal, tax_total, discount_total, grand_total, created_at) VALUES
('e0000000-0000-4000-8000-000000000004', 'SUB-2026-004', '33333333-3333-4333-a333-333333333333', 'c0000000-0000-4000-8000-000000000001', NULL, 'QUOTATION', '2026-11-01', '2027-04-30', 'Immediate Payment', 205.00, 36.90, 0.00, 241.90, '2026-10-28T14:30:00Z');

-- 5) DRAFT: SUB-2026-005 (Starter Monthly Draft)
INSERT INTO subscriptions (id, sub_number, customer_id, plan_id, discount_id, stage, start_date, expiry_date, payment_terms, subtotal, tax_total, discount_total, grand_total, created_at) VALUES
('e0000000-0000-4000-8000-000000000005', 'SUB-2026-005', '33333333-3333-4333-a333-333333333333', 'c0000000-0000-4000-8000-000000000001', NULL, 'DRAFT', '2026-11-15', '2027-05-15', 'Immediate Payment', 255.00, 45.90, 0.00, 300.90, '2026-10-30T16:00:00Z');

-- 6) CLOSED: SUB-2026-006 (Growth Yearly Historical Lifecycle Finished)
INSERT INTO subscriptions (id, sub_number, customer_id, plan_id, discount_id, stage, start_date, expiry_date, payment_terms, subtotal, tax_total, discount_total, grand_total, created_at) VALUES
('e0000000-0000-4000-8000-000000000006', 'SUB-2026-006', '33333333-3333-4333-a333-333333333333', 'c0000000-0000-4000-8000-000000000002', NULL, 'CLOSED', '2024-10-01', '2025-09-30', 'Immediate Payment', 600.00, 108.00, 0.00, 708.00, '2024-10-01T09:00:00Z');

-- ------------------------------------------------------------------------------
-- 7. SUBSCRIPTION LINES (Accurate Line Item Linkages)
-- ------------------------------------------------------------------------------
-- Lines for SUB-2026-001
INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_amount, line_total, created_at) VALUES
('80000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', NULL, 5, 120.00, 108.00, 600.00, '2026-01-01T09:00:00Z'),
('80000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 1, 810.00, 145.80, 810.00, '2026-01-01T09:00:00Z');

-- Lines for SUB-2026-002
INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_amount, line_total, created_at) VALUES
('80000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', NULL, 2, 85.00, 30.60, 170.00, '2026-02-01T10:00:00Z');

-- Lines for SUB-2026-003
INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_amount, line_total, created_at) VALUES
('80000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', NULL, 10, 120.00, 216.00, 1200.00, '2026-10-25T11:00:00Z'),
('80000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 2, 810.00, 291.60, 1620.00, '2026-10-25T11:00:00Z');

-- Lines for SUB-2026-004
INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_amount, line_total, created_at) VALUES
('80000000-0000-4000-8000-000000000006', 'e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', NULL, 1, 120.00, 21.60, 120.00, '2026-10-28T14:30:00Z'),
('80000000-0000-4000-8000-000000000007', 'e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', NULL, 1, 85.00, 15.30, 85.00, '2026-10-28T14:30:00Z');

-- Lines for SUB-2026-005
INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_amount, line_total, created_at) VALUES
('80000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', NULL, 3, 85.00, 45.90, 255.00, '2026-10-30T16:00:00Z');

-- Lines for SUB-2026-006
INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_amount, line_total, created_at) VALUES
('80000000-0000-4000-8000-000000000009', 'e0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', NULL, 5, 120.00, 108.00, 600.00, '2024-10-01T09:00:00Z');

-- ------------------------------------------------------------------------------
-- 8. INVOICES (5 Invoices: 2 PAID, 2 CONFIRMED [1 Past Due], 1 DRAFT)
-- ------------------------------------------------------------------------------
-- 1) PAID: INV-2026-001 (linked to SUB-2026-001)
INSERT INTO invoices (id, invoice_number, subscription_id, customer_id, status, subtotal, tax_amount, discount_amount, total_amount, due_date, paid_at, created_at) VALUES
('f0000000-0000-4000-8000-000000000001', 'INV-2026-001', 'e0000000-0000-4000-8000-000000000001', '33333333-3333-4333-a333-333333333333', 'PAID', 1410.00, 228.42, 141.00, 1497.42, '2026-01-15', '2026-01-14T10:30:00Z', '2026-01-01T09:05:00Z');

-- 2) PAID: INV-2026-002 (linked to SUB-2026-006 historical)
INSERT INTO invoices (id, invoice_number, subscription_id, customer_id, status, subtotal, tax_amount, discount_amount, total_amount, due_date, paid_at, created_at) VALUES
('f0000000-0000-4000-8000-000000000002', 'INV-2026-002', 'e0000000-0000-4000-8000-000000000006', '33333333-3333-4333-a333-333333333333', 'PAID', 600.00, 108.00, 0.00, 708.00, '2025-10-01', '2025-09-30T14:15:00Z', '2024-10-01T09:05:00Z');

-- 3) CONFIRMED (PAST DUE): INV-2026-003 (linked to SUB-2026-002, Due: 2026-10-15)
INSERT INTO invoices (id, invoice_number, subscription_id, customer_id, status, subtotal, tax_amount, discount_amount, total_amount, due_date, paid_at, created_at) VALUES
('f0000000-0000-4000-8000-000000000003', 'INV-2026-003', 'e0000000-0000-4000-8000-000000000002', '33333333-3333-4333-a333-333333333333', 'CONFIRMED', 170.00, 30.60, 0.00, 200.60, '2026-10-15', NULL, '2026-10-01T10:00:00Z');

-- 4) CONFIRMED: INV-2026-004 (linked to SUB-2026-003, Due: 2026-11-15)
INSERT INTO invoices (id, invoice_number, subscription_id, customer_id, status, subtotal, tax_amount, discount_amount, total_amount, due_date, paid_at, created_at) VALUES
('f0000000-0000-4000-8000-000000000004', 'INV-2026-004', 'e0000000-0000-4000-8000-000000000003', '33333333-3333-4333-a333-333333333333', 'CONFIRMED', 2820.00, 417.60, 500.00, 2737.60, '2026-11-15', NULL, '2026-10-25T11:15:00Z');

-- 5) DRAFT: INV-2026-005 (linked to SUB-2026-004, Due: 2026-11-30)
INSERT INTO invoices (id, invoice_number, subscription_id, customer_id, status, subtotal, tax_amount, discount_amount, total_amount, due_date, paid_at, created_at) VALUES
('f0000000-0000-4000-8000-000000000005', 'INV-2026-005', 'e0000000-0000-4000-8000-000000000004', '33333333-3333-4333-a333-333333333333', 'DRAFT', 205.00, 36.90, 0.00, 241.90, '2026-11-30', NULL, '2026-10-28T14:45:00Z');

-- ------------------------------------------------------------------------------
-- 9. PAYMENTS (2 Payments for the 2 Paid Invoices)
-- ------------------------------------------------------------------------------
INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, notes, created_at) VALUES
('90000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001', 1497.42, 'Credit Card', '2026-01-14', 'Stripe Corporate Visa ending 4242 - Auth #981240', '2026-01-14T10:30:00Z'),
('90000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000002', 708.00, 'Bank Transfer', '2025-09-30', 'Wire Settlement Ref #WT-98231ACH - JPMorgan Chase', '2025-09-30T14:15:00Z');
