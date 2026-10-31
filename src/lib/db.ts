/**
 * Outloop / Brightloop Subscriptions
 * Database Access Utilities & Engine Connector
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";

let dbInstance: any = null;

function getDatabaseClass() {
  if (typeof (globalThis as any).Bun !== "undefined") {
    const req = createRequire(import.meta.url);
    const mod = "bun" + ":sqlite";
    return req(mod).Database;
  }
  return null;
}

export interface DbConfig {
  dbPath?: string;
  inMemory?: boolean;
}

export function getDb(config?: DbConfig): any {
  if (dbInstance && !config?.inMemory) {
    return dbInstance;
  }

  const DatabaseCtor = getDatabaseClass();
  if (!DatabaseCtor) {
    throw new Error("Local SQLite engine is only supported in Bun runtime. Please use Supabase Cloud or run via Bun.");
  }

  const dbPath = config?.inMemory
    ? ":memory:"
    : (config?.dbPath || path.resolve(process.cwd(), "outloop.db"));

  const db = new DatabaseCtor(dbPath, { create: true });

  // STRICT RELATIONAL INTEGRITY ENFORCEMENT
  db.run("PRAGMA foreign_keys = ON;");
  db.run("PRAGMA journal_mode = WAL;");

  if (!config?.inMemory) {
    dbInstance = db;
  }

  return db;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Translates PostgreSQL DDL to standard relational SQLite DDL for local execution
 * while preserving identical tables, foreign keys, cascades, checks, and unique constraints.
 */
export function getLocalSchemaSql(): string {
  return `
    PRAGMA foreign_keys = ON;

    DROP TABLE IF EXISTS payments;
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS subscription_lines;
    DROP TABLE IF EXISTS subscriptions;
    DROP TABLE IF EXISTS discounts;
    DROP TABLE IF EXISTS plans;
    DROP TABLE IF EXISTS product_variants;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS profiles;

    CREATE TABLE profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'STAFF', 'CUSTOMER')),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      product_type TEXT NOT NULL DEFAULT 'SERVICE' CHECK(product_type IN ('SERVICE', 'CONSUMABLE')),
      sales_price REAL NOT NULL CHECK(sales_price >= 0),
      cost_price REAL NOT NULL DEFAULT 0.0 CHECK(cost_price >= 0),
      tax_rate REAL NOT NULL DEFAULT 18.00 CHECK(tax_rate >= 0),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      variant_name TEXT NOT NULL,
      extra_price REAL NOT NULL DEFAULT 0.0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      billing_interval TEXT NOT NULL CHECK(billing_interval IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
      min_quantity INTEGER NOT NULL DEFAULT 1 CHECK(min_quantity >= 1),
      start_date TEXT NOT NULL DEFAULT (date('now')),
      end_date TEXT,
      auto_close_on_end INTEGER NOT NULL DEFAULT 0,
      can_pause INTEGER NOT NULL DEFAULT 1,
      can_renew INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE discounts (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL CHECK(discount_type IN ('PERCENTAGE', 'FIXED')),
      value REAL NOT NULL CHECK(value > 0),
      min_quantity INTEGER NOT NULL DEFAULT 0 CHECK(min_quantity >= 0),
      min_amount REAL NOT NULL DEFAULT 0.0 CHECK(min_amount >= 0),
      max_uses INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0 CHECK(used_count >= 0),
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE subscriptions (
      id TEXT PRIMARY KEY,
      sub_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
      plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
      discount_id TEXT REFERENCES discounts(id) ON DELETE SET NULL,
      stage TEXT NOT NULL DEFAULT 'DRAFT' CHECK(stage IN ('DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED')),
      start_date TEXT NOT NULL DEFAULT (date('now')),
      expiry_date TEXT,
      payment_terms TEXT NOT NULL DEFAULT 'Immediate Payment',
      subtotal REAL NOT NULL DEFAULT 0.0 CHECK(subtotal >= 0),
      tax_total REAL NOT NULL DEFAULT 0.0 CHECK(tax_total >= 0),
      discount_total REAL NOT NULL DEFAULT 0.0 CHECK(discount_total >= 0),
      grand_total REAL NOT NULL DEFAULT 0.0 CHECK(grand_total >= 0),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE subscription_lines (
      id TEXT PRIMARY KEY,
      subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
      unit_price REAL NOT NULL CHECK(unit_price >= 0),
      tax_amount REAL NOT NULL DEFAULT 0.0 CHECK(tax_amount >= 0),
      line_total REAL NOT NULL CHECK(line_total >= 0),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      subscription_id TEXT REFERENCES subscriptions(id) ON DELETE SET NULL,
      customer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
      status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED')),
      subtotal REAL NOT NULL CHECK(subtotal >= 0),
      tax_amount REAL NOT NULL DEFAULT 0.0 CHECK(tax_amount >= 0),
      discount_amount REAL NOT NULL DEFAULT 0.0 CHECK(discount_amount >= 0),
      total_amount REAL NOT NULL CHECK(total_amount >= 0),
      due_date TEXT NOT NULL,
      paid_at TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      amount REAL NOT NULL CHECK(amount > 0),
      payment_method TEXT NOT NULL,
      payment_date TEXT NOT NULL DEFAULT (date('now')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE INDEX idx_profiles_email ON profiles(email);
    CREATE INDEX idx_products_type ON products(product_type);
    CREATE INDEX idx_variants_product ON product_variants(product_id);
    CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
    CREATE INDEX idx_subscriptions_stage ON subscriptions(stage);
    CREATE INDEX idx_subscriptions_sub_number ON subscriptions(sub_number);
    CREATE INDEX idx_lines_subscription ON subscription_lines(subscription_id);
    CREATE INDEX idx_invoices_customer ON invoices(customer_id);
    CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
    CREATE INDEX idx_invoices_status ON invoices(status);
    CREATE INDEX idx_payments_invoice ON payments(invoice_id);
  `;
}
