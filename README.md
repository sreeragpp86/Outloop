# Outloop ⚡
> **Unified Subscription Lifecycle, Quotation Automation & Recurring Billing Engine**  
> *Engineered for Brightloop Software Inc. • Enterprise Recurring Billing Infrastructure*

[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-zinc?style=flat-square)](LICENSE)

---

## 📖 Executive Summary

**Outloop** replaces fragile spreadsheets, manual billing errors, and uncollected receivables with an enterprise-grade, event-driven subscription management platform. Built to solve the operational demands of **Brightloop Software**, Outloop manages the entire commercial lifecycle: from structured quotation templates and dynamic product variant pricing to idempotent automated billing runs, multi-rail payment reconciliation, and real-time executive finance analytics.

Designed under strict **Anti-AI-Slop** design principles (inspired by Apple, Linear, and Emil Kowalski design engineering), Outloop pairs high-density data layouts and tactile micro-interactions with a deterministic relational database architecture.

---

## 🔑 Quick-Access Test Personas & Credentials

Outloop implements strict Role-Based Access Control (RBAC). Evaluators can switch roles instantly using the persistent **"Simulate Persona"** switcher in the top navigation bar, or log in directly via `/login` using the one-click demo quick-fill presets:

| Persona | Account Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** *(Sarah Connor)* | `admin@brightloop.io` | `Enterprise#2026` | Full ERP control, Staff provisioning, Catalog & Variant pricing, Plans, Discounts, Global Audits |
| **Staff** *(Alex Rivera)* | `staff@brightloop.io` | `Enterprise#2026` | Quotation creation, Subscriptions pipeline, Invoice generation, Payment registration |
| **Customer** *(Acme Corp / Liam)* | `liam@acme.com` | `Enterprise#2026` | Restricted Customer Portal: Self-service viewing of active subscriptions, download/print invoices |

---

## 🎯 Problem Statement Mapping & Core Capabilities

Outloop directly solves every scene outlined in the Brightloop Software problem brief:

### Scene 1: Account Creation & Role-Based Access Control
- **Strict Password Validation:** Client and server-side validation enforcing length $\ge 9$ characters, at least one uppercase letter, one lowercase letter, and one special character with a live, visual 4-tier checkmark checklist.
- **Forgot Password Workflow:** Resilient password reset request drawer with simulated email notification dispatch.
- **Admin-Only Staff Provisioning:** Restricted `/settings/staff` directory allowing only Admins to onboard internal staff members. Unauthorized roles receive immediate 403 route protection.
- **Public Front Door:** High-craft marketing landing page at `/welcome` with live architectural capability cards, product snapshots, and direct demo launchers.

### Scene 2: Product Catalog & Dynamic Variant Pricing
- **Base Products:** Configurable service and consumable items with base cost, sales price, tax codes, and internal audit notes.
- **Dynamic Variant Deltas:** Relational `product_variants` schema. Selecting a variant (e.g., *Enterprise Edition*) automatically computes dynamic price deltas (`+$560.00`) directly on line items before tax calculation.
- **Configurable Subscription Plans:** Supports recurring billing intervals (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), seat minimums, validity horizons, and granular operational flags (`can_pause`, `can_renew`, `auto_close_on_end`).

### Scene 3: Quotation Studio & Subscription State Machine
- **Quotation Templates:** Accelerates sales quoting with pre-configured plan lines and term presets.
- **Deterministic Pipeline State Machine:**
  $$\text{Draft} \longrightarrow \text{Quotation} \longrightarrow \text{Confirmed} \longrightarrow \text{Active} \longleftrightarrow \text{Paused} \longrightarrow \text{Closed}$$
- **Discounts Engine:** Admin-defined rules supporting percentage or fixed reductions, seat/value thresholds (e.g., `BULK10` for 10% off on 5+ seats, `SCALE500` for fixed discount), usage capping, and date limits.
- **Reactive Financial Math:** Real-time computation of variant additions, line subtotals, itemized discounts, and 18% standard VAT/tax.

### Scene 4: Automated "Billing Day" Engine
- **One-Click Batch Execution:** Scans all subscriptions in `ACTIVE` stage due for billing.
- **Strict Idempotency Guard:** Guarantees zero duplicate billing within the same renewal cycle using contract-period verification.
- **Pre-filled Invoice Generation:** Carries over line items, customer bill-to details, taxes, and active discount codes into a generated `DRAFT` invoice.
- **Printable Enterprise Invoice:** Integrated print stylesheet (`@media print`) rendering a clean, single-page monochrome A4 tax document hiding UI controls, with status watermarks, itemized line tables, and B2B remittance instructions.

### Scene 5: Multi-Rail Payment Reconciliation
- **Payment Lifecycle:** Invoices advance deterministically across `Draft` → `Confirmed` → `Paid` (or `Cancelled`).
- **Payment Registration Drawer:** Supports multi-rail recording (`Bank Transfer`, `Credit Card`, `ACH`) with transaction memos, date stamping, and automatic invoice settlement upon full balance capture.
- **Receivables Chasing:** Live overdue calculation flagging unpaid invoices past their `due_date`.

### Scene 6: Executive Finance Lead Dashboard
- **Sub-Second KPI Metrics:**
  * **MRR (Monthly Recurring Revenue):** Normalized monthly recurring contract value.
  * **ARR (Annual Run Rate):** Annualized run rate ($MRR \times 12$).
  * **Collected Revenue:** Sum of all recorded payments.
  * **Active Subscriptions:** Real-time count of active enterprise contracts.
  * **Overdue Receivables:** Total unsettled debt flagged with amber/rose urgency indicators.
- **Visual Analytics:** Interactive trend visualization comparing monthly invoiced billing vs. collected cash.
- **Data Portability:** Instant CSV exports across subscriptions and invoices for external auditing.

---

## 🏛 Relational Architecture & Database Design

```
 ┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────┐
 │    profiles     │       │     subscriptions      │       │      plans      │
 ├─────────────────┤       ├────────────────────────┤       ├─────────────────┤
 │ id (UUID, PK)   │1     *│ id (UUID, PK)          │*     1│ id (UUID, PK)   │
 │ name            ├───────┤ customer_id (FK)       ├───────┤ name            │
 │ email (UNIQUE)  │       │ plan_id (FK)           │       │ billing_interval│
 │ role (ENUM)     │       │ discount_id (FK, opt)  │       │ min_quantity    │
 └─────────────────┘       │ stage (ENUM)           │       │ auto_close      │
                           │ subtotal, tax, grand   │       └─────────────────┘
                           └───────────┬────────────┘
                                       │1
                                       │*
                           ┌───────────┴────────────┐
                           │   subscription_lines   │
                           ├────────────────────────┤
                           │ id (UUID, PK)          │
                           │ product_id (FK) ───────┼───► products (base price, tax)
                           │ variant_id (FK, opt) ──┼───► product_variants (+560 delta)
                           │ quantity, line_total   │
                           └────────────────────────┘
                                       │1
                                       │* (Generated via Billing Run)
                           ┌───────────▼────────────┐       ┌─────────────────┐
                           │        invoices        │1     *│    payments     │
                           ├────────────────────────┼───────┤ id (UUID, PK)   │
                           │ id (UUID, PK)          │       │ amount          │
                           │ status (DRAFT..PAID)   │       │ payment_method  │
                           │ subtotal, tax, total   │       │ payment_date    │
                           │ due_date, paid_at      │       └─────────────────┘
                           └────────────────────────┘
```

---

## 🛠 Technology Stack

- **Framework:** Next.js 16 (React 19, App Router, Turbopack)
- **Language:** TypeScript 5.0 (Strict mode enabled)
- **Database:** PostgreSQL (Supabase with Foreign Key & Cascade Enforcement, SQLite local fallback)
- **Styling & Design System:** Tailwind CSS v4, High-Density Enterprise Craft
- **Icons & Visualization:** Lucide React, Native SVG Trend Visualization
- **Data Export:** RFC-compliant Tabular CSV Generation Utility

---

## 🚀 Local Installation & Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/sreeragpp86/Outloop.git
cd Outloop
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/outloop
```

### 3. Run Database Migrations & Enterprise Seed
Initialize the database schema and populate realistic seed data (3 users, 3 products, variants, 3 plans, 2 discount codes, 6 lifecycle subscriptions, 5 invoices):
```bash
npm run db:seed
npm run db:verify
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Or build and run the production server:
```bash
npm run build
npm run start
```

---

## 📁 Repository Directory Structure

```text
Outloop/
├── src/
│   ├── app/
│   │   ├── api/                   # REST API routes (Auth, Invoices, Billing Run, Subscriptions, Staff)
│   │   ├── invoices/              # Invoices master table & detailed print views
│   │   │   ├── [id]/page.tsx      # Scene 4 & 5: Printable enterprise invoice layout
│   │   │   └── page.tsx           # Billing Run trigger, CSV export & invoice ledger
│   │   ├── login/page.tsx         # Scene 1: Sign in with demo quick-fill presets
│   │   ├── portal/page.tsx        # Scene 1 & 5: Customer self-service portal
│   │   ├── products/page.tsx      # Scene 2: Catalog, variant deltas & discount vouchers
│   │   ├── settings/
│   │   │   └── staff/page.tsx     # Scene 1: Admin staff directory & provisioning
│   │   ├── signup/page.tsx        # Scene 1: Password regex verification checklist
│   │   ├── subscriptions/
│   │   │   ├── [id]/page.tsx      # Scene 3: Studio & interactive stage pipeline
│   │   │   └── page.tsx           # Subscriptions & Quotes master data grid with CSV export
│   │   ├── welcome/page.tsx       # Public marketing front door & capability overview
│   │   ├── globals.css            # Tailwind v4 configuration & @media print styles
│   │   ├── layout.tsx             # Root layout with RoleProvider & AppShell
│   │   └── page.tsx               # Scene 6: Finance Lead Executive Dashboard
│   ├── components/
│   │   ├── dashboard/             # SVG revenue trend visualization
│   │   ├── invoices/              # Payment modal & batch billing execution drawer
│   │   ├── staff/                 # Staff invite modal & role assignment
│   │   ├── subscriptions/         # Stage pipeline bar, line item matrix & new quote drawer
│   │   ├── ui/                    # Metric cards, status badges, page headers
│   │   ├── AppShell.tsx           # Dynamic shell supporting full-bleed public & internal layouts
│   │   ├── Header.tsx             # Global navigation bar with links & persona switcher
│   │   └── PersonaSwitcher.tsx    # Live persona switcher (Admin, Staff, Customer)
│   ├── context/
│   │   └── RoleContext.tsx        # Session persona & RBAC state provider
│   ├── lib/
│   │   ├── csv.ts                 # RFC-compliant CSV data export utility
│   │   ├── db.ts                  # Local SQLite schema & verification fallback
│   │   └── server-db.ts           # Supabase REST client with Bearer auth
│   ├── scripts/
│   │   ├── seed.ts                # Enterprise seed runner (3 personas, 3 products, subscriptions)
│   │   └── verify.ts              # Database integrity & relational cascade auditor
│   └── types/
│       └── database.ts            # TypeScript definitions for entities, enums, & line items
├── supabase/
│   ├── migrations/
│   │   └── 20261031000000_init_schema.sql # Relational PostgreSQL DDL
│   └── seed.sql                   # Standalone SQL seed script
├── LICENSE                        # MIT License
├── package.json
└── README.md
```

---

## 📄 License
Released under the [MIT License](LICENSE). Copyright © 2026 Brightloop Software Inc. All rights reserved.
