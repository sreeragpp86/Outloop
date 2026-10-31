'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Search,
  RefreshCw,
  FileText,
  CreditCard,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { InvoiceStatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { PaymentModal } from '@/components/invoices/PaymentModal';
import { BillingRunModal } from '@/components/invoices/BillingRunModal';

interface InvoiceListItem {
  id: string;
  invoice_number: string;
  subscription_id: string | null;
  subscription_ref: string | null;
  customer_id: string;
  customer?: { id: string; name: string; email: string };
  status: 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  due_date: string;
  paid_at: string | null;
  created_at: string;
  is_overdue: boolean;
}

type FilterTab = 'ALL' | 'DRAFT' | 'CONFIRMED' | 'PAID' | 'OVERDUE';

export default function InvoicesPage() {
  const router = useRouter();
  const { role, persona } = useRole();

  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<InvoiceListItem | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter based on persona role, active tab, and search query
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Role scope: customers only see their own accounts
      if (role === 'CUSTOMER' && inv.customer_id !== persona.id) {
        return false;
      }

      // Tab filter
      if (activeTab === 'DRAFT' && inv.status !== 'DRAFT') return false;
      if (activeTab === 'CONFIRMED' && inv.status !== 'CONFIRMED') return false;
      if (activeTab === 'PAID' && inv.status !== 'PAID') return false;
      if (activeTab === 'OVERDUE' && !inv.is_overdue) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = inv.invoice_number.toLowerCase().includes(q);
        const matchesCust = inv.customer?.name.toLowerCase().includes(q);
        const matchesSub = inv.subscription_ref?.toLowerCase().includes(q);
        return Boolean(matchesNum || matchesCust || matchesSub);
      }

      return true;
    });
  }, [invoices, role, persona.id, activeTab, searchQuery]);

  // Aggregate Metrics based on visible persona scope
  const metrics = useMemo(() => {
    const list = role === 'CUSTOMER'
      ? invoices.filter((inv) => inv.customer_id === persona.id)
      : invoices;

    let totalInvoiced = 0;
    let outstandingBalance = 0;
    let overdueCount = 0;
    let overdueAmount = 0;

    list.forEach((inv) => {
      if (inv.status !== 'CANCELLED') {
        totalInvoiced += inv.total_amount;
        if (inv.status === 'CONFIRMED') {
          outstandingBalance += inv.balance_due;
        }
        if (inv.is_overdue) {
          overdueCount++;
          overdueAmount += inv.balance_due;
        }
      }
    });

    return {
      totalInvoiced: totalInvoiced.toFixed(2),
      outstandingBalance: outstandingBalance.toFixed(2),
      overdueCount,
      overdueAmount: overdueAmount.toFixed(2),
    };
  }, [invoices, role, persona.id]);

  // Tab counter counts
  const tabCounts = useMemo(() => {
    const list = role === 'CUSTOMER'
      ? invoices.filter((inv) => inv.customer_id === persona.id)
      : invoices;

    return {
      ALL: list.length,
      DRAFT: list.filter((i) => i.status === 'DRAFT').length,
      CONFIRMED: list.filter((i) => i.status === 'CONFIRMED').length,
      PAID: list.filter((i) => i.status === 'PAID').length,
      OVERDUE: list.filter((i) => i.is_overdue).length,
    };
  }, [invoices, role, persona.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Cash Collection"
        description="Run batch billing days, reconcile settlements, and monitor receivables."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Invoices' },
        ]}
        actions={
          role !== 'CUSTOMER' ? (
            <button
              onClick={() => setIsBillingModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold rounded-md shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Billing Day
            </button>
          ) : undefined
        }
      />

      {/* Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Invoiced"
          value={`$${metrics.totalInvoiced}`}
          icon={DollarSign}
        />
        <MetricCard
          title="Outstanding Receivables"
          value={`$${metrics.outstandingBalance}`}
          icon={Clock}
        />
        <MetricCard
          title="Overdue Invoices"
          value={`${metrics.overdueCount} ($${metrics.overdueAmount})`}
          icon={AlertTriangle}
        />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['ALL', 'DRAFT', 'CONFIRMED', 'PAID', 'OVERDUE'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <span>
                {tab === 'ALL'
                  ? 'All Invoices'
                  : tab === 'CONFIRMED'
                  ? 'Confirmed (Unpaid)'
                  : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  activeTab === tab
                    ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all font-sans"
            />
          </div>
          <button
            onClick={fetchInvoices}
            title="Refresh list"
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Invoices Data Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-medium">
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Subscription</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4">Total</th>
                <th className="py-2.5 px-4">Balance Due</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading && invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                      Loading invoices...
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-zinc-500">
                      <FileText className="w-8 h-8 stroke-1 text-zinc-400" />
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">No invoices found</p>
                      <p className="text-xs text-zinc-400">
                        {searchQuery
                          ? 'No invoice records match your active search terms.'
                          : 'There are no invoices in this view category yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {inv.customer?.name || 'Customer'}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {inv.customer?.email || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {inv.subscription_ref ? (
                        <Link
                          href={`/subscriptions/${inv.subscription_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-zinc-600 dark:text-zinc-400 hover:underline"
                        >
                          {inv.subscription_ref}
                        </Link>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span
                        className={
                          inv.is_overdue
                            ? 'text-rose-600 font-semibold'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }
                      >
                        {inv.due_date}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      ${inv.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {inv.balance_due === 0 ? (
                        <span className="text-emerald-600">$0.00</span>
                      ) : (
                        <span className={inv.is_overdue ? 'text-rose-600' : 'text-zinc-900 dark:text-zinc-100'}>
                          ${inv.balance_due.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <InvoiceStatusBadge status={inv.status} isOverdue={inv.is_overdue} />
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        {inv.status === 'CONFIRMED' && inv.balance_due > 0 && role !== 'CUSTOMER' && (
                          <button
                            onClick={() => setPaymentTarget(inv)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2 py-1 rounded transition-colors active:scale-[0.98]"
                          >
                            <CreditCard className="w-3 h-3 text-zinc-500" />
                            Pay
                          </button>
                        )}
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                        >
                          View
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Registration Modal */}
      {paymentTarget && (
        <PaymentModal
          isOpen={Boolean(paymentTarget)}
          invoiceId={paymentTarget.id}
          invoiceNumber={paymentTarget.invoice_number}
          totalAmount={paymentTarget.total_amount}
          balanceDue={paymentTarget.balance_due}
          onClose={() => setPaymentTarget(null)}
          onPaymentSuccess={() => {
            fetchInvoices();
          }}
        />
      )}

      {/* Automated Billing Day Automation Modal */}
      <BillingRunModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onRunComplete={() => {
          fetchInvoices();
        }}
      />
    </div>
  );
}
