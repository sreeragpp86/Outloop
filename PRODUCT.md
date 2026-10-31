# Product Specification: Outloop (Brightloop Subscriptions)

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
- Next.js (App Router), TypeScript, Tailwind CSS
- Database: PostgreSQL (Supabase with Foreign Key & Cascade Enforcement, PGlite local verification)
- State & Business Logic: Functional relational billing engine, strict enum states, transaction-safe lifecycle transitions

## Users
1. **Sarah Connor (Admin - `admin@brightloop.io`)**: Controls enterprise subscription policies, product catalogue, variant pricing rules, and global discount strategies.
2. **Alex Rivera (Staff - `staff@brightloop.io`)**: Manages quotation generation, confirms subscriptions, oversees billing lifecycles, and audits receivables.
3. **Acme Corp / Liam Patel (Customer - `liam@acme.com`)**: End customer receiving enterprise SaaS services, reviewing quotations, and settling recurring invoices.

## Product Purpose
Outloop is an enterprise-grade Subscription Lifecycle, Quotation Automation & Recurring Billing Engine built for Brightloop Software Inc. It bridges complex B2B subscription sales with automated recurring invoicing, variant-based pricing, volume discounts, and lifecycle state management (Draft → Quotation → Confirmed → Active ↔ Paused → Closed).

## Positioning
Unlike lightweight consumer billing widgets or bloated monolithic suites, Outloop pairs enterprise ERP relational rigor (strict product variants, multi-stage subscription lifecycle, tax & discount line item cascades) with the velocity, keyboard accessibility, and tactile polish of high-end financial software.

## Anti-AI-Slop & Design Directives
- **Zero generic gradient soup**: No purple-to-indigo or generic AI SaaS tropes.
- **Enterprise Density**: High-density typography (Inter / Geist), tabular figures for IDs and financial numbers (`font-mono`).
- **Tactile Micro-interactions**: Emil Kowalski motion principles, active states (`active:scale-[0.98]`), instant feedback.
- **Neutral Palette**: Slate / Zinc enterprise tone with deliberate semantic accents.
