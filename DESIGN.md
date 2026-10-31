# Design System: Outloop / Brightloop Subscriptions

<!-- impeccable:design-schema 1 -->

## Design System Foundations & Tone
Outloop's interface embodies the precision, restraint, and tactile immediacy of mission-critical financial and ERP software. We eliminate all AI boilerplate, generic purple gradients, and bloated cards in favor of a crisp, dense, functional workspace.

## Core Rules & Anti-AI-Slop Directives
1. **Typography**:
   - Primary: Geist / Inter for crisp readability at 11px - 14px enterprise densities.
   - Financial Data & Identifiers: Monospace (`font-mono`, tabular numbers `tabular-nums`) for subscription numbers (e.g., `SUB-2026-001`), invoice numbers (`INV-2026-001`), currency calculations, unit prices, and tax rates.
2. **Color Palette (Slate / Zinc Neutral Foundation)**:
   - Surface / Canvas: `zinc-950` / `zinc-900` / `zinc-850` (Dark) and `white` / `zinc-50` / `zinc-100` (Light).
   - Borders: Subtle 1px borders (`zinc-200` in light, `zinc-800` in dark).
   - Status Semantics:
     - DRAFT: Neutral muted zinc (`bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300`)
     - QUOTATION: Indigo/Blue slate accent (`bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200`)
     - CONFIRMED: Amber warning tone (`bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200`)
     - ACTIVE / PAID: Emerald success tone (`bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200`)
     - PAUSED: Slate orange (`bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200`)
     - CLOSED / CANCELLED: Rose/Zinc muted (`bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200`)
3. **Tactile Micro-Interactions (Emil Kowalski & Apple Design Principles)**:
   - Buttons & Interactive Elements: Active compression `active:scale-[0.98]` with instant 100ms response.
   - Smooth Interruptible Transitions: Springs and `ease-out` timing curves rather than sluggish `ease-in` or uniform `transition: all 300ms`.
   - Popovers & Menus: Transform-origin anchored to triggers with entry scale `scale(0.96) -> scale(1.0)`.
   - Density: Compact tables, minimal padding, explicit tabular data alignment (text left, numbers right, badges center).
