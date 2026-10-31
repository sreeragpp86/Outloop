/**
 * Outloop / Brightloop Subscriptions
 * Database Type Definitions matching PostgreSQL / Supabase Schema
 */

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';
export type BillingInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type SubscriptionStage = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

export interface Profile {
  id: string; // UUID
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string; // UUID
  name: string;
  product_type: 'SERVICE' | 'CONSUMABLE';
  sales_price: number;
  cost_price: number;
  tax_rate: number;
  notes?: string | null;
  created_at: string;
}

export interface ProductVariant {
  id: string; // UUID
  product_id: string; // FK -> products.id
  variant_name: string;
  extra_price: number;
  created_at: string;
}

export interface Plan {
  id: string; // UUID
  name: string;
  billing_interval: BillingInterval;
  min_quantity: number;
  start_date: string;
  end_date?: string | null;
  auto_close_on_end: boolean;
  can_pause: boolean;
  can_renew: boolean;
  created_at: string;
}

export interface Discount {
  id: string; // UUID
  code: string;
  discount_type: DiscountType;
  value: number;
  min_quantity: number;
  min_amount: number;
  max_uses?: number | null;
  used_count: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string; // UUID
  sub_number: string;
  customer_id: string; // FK -> profiles.id
  plan_id: string; // FK -> plans.id
  discount_id?: string | null; // FK -> discounts.id
  stage: SubscriptionStage;
  start_date: string;
  expiry_date?: string | null;
  payment_terms: string;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  grand_total: number;
  created_at: string;
}

export interface SubscriptionLine {
  id: string; // UUID
  subscription_id: string; // FK -> subscriptions.id
  product_id: string; // FK -> products.id
  variant_id?: string | null; // FK -> product_variants.id
  quantity: number;
  unit_price: number;
  tax_amount: number;
  line_total: number;
  created_at: string;
}

export interface Invoice {
  id: string; // UUID
  invoice_number: string;
  subscription_id?: string | null; // FK -> subscriptions.id
  customer_id: string; // FK -> profiles.id
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  due_date: string;
  paid_at?: string | null;
  created_at: string;
}

export interface Payment {
  id: string; // UUID
  invoice_id: string; // FK -> invoices.id
  amount: number;
  payment_method: 'Bank Transfer' | 'Credit Card' | 'UPI' | string;
  payment_date: string;
  notes?: string | null;
  created_at: string;
}

export interface DatabaseSchema {
  profiles: Profile;
  products: Product;
  product_variants: ProductVariant;
  plans: Plan;
  discounts: Discount;
  subscriptions: Subscription;
  subscription_lines: SubscriptionLine;
  invoices: Invoice;
  payments: Payment;
}
