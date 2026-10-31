'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  RefreshCw,
  FileText,
  Download
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/context/ToastContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { NewSubscriptionDrawer } from '@/components/subscriptions/NewSubscriptionDrawer';
import { exportToCsv } from '@/lib/csv';

interface SubscriptionSummary {
  id: string;
  sub_number: string;
  customer_id: string;
  customer?: { id: string; name: string; email: string };
  customer_name: string;
  customer_email: string;
  plan_id: string;
  plan?: { id: string; name: string; billing_interval: string };
  plan_name: string;
  billing_interval: string;
  stage: 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  subtotal: number;
  discount_total?: number;
  tax_total?: number;
  grand_total: number;
  start_date: string;
  expiry_date?: string | null;
  created_at: string;
}

type FilterTab = 'ALL' | 'QUOTES' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { role, persona } = useRole();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<SubscriptionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subscriptions');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.subscriptions || []);
        const normalized = list.map((s: any) => ({
          ...s,
          customer_name: s.customer?.name || s.customer_name || 'Unknown Customer',
          customer_email: s.customer?.email || s.customer_email || '—',
          plan_name: s.plan?.name || s.plan_name || 'Standard Plan',
          billing_interval: s.plan?.billing_interval || s.billing_interval || 'MONTHLY',
        }));
        setSubscriptions(normalized);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filter based on role, tab, and search query
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      // Role scope: customers only see their own accounts
      if (role === 'CUSTOMER' && sub.customer_id !== persona.id) {
        return false;
      }

      // Tab filter
      if (activeTab === 'QUOTES' && !['DRAFT', 'QUOTATION'].includes(sub.stage)) return false;
      if (activeTab === 'ACTIVE' && sub.stage !== 'ACTIVE') return false;
      if (activeTab === 'PAUSED' && sub.stage !== 'PAUSED') return false;
      if (activeTab === 'CLOSED' && sub.stage !== 'CLOSED') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSub = sub.sub_number.toLowerCase().includes(q);
        const matchesName = sub.customer_name?.toLowerCase().includes(q);
        const matchesEmail = sub.customer_email?.toLowerCase().includes(q);
        const matchesPlan = sub.plan_name?.toLowerCase().includes(q);
        return Boolean(matchesSub || matchesName || matchesEmail || matchesPlan);
      }

      return true;
    });
  }, [subscriptions, role, persona.id, activeTab, searchQuery]);

  // Tab count calculations
  const counts = useMemo(() => {
    const list = role === 'CUSTOMER' 
      ? subscriptions.filter(s => s.customer_id === persona.id)
      : subscriptions;

    return {
      ALL: list.length,
      QUOTES: list.filter(s => ['DRAFT', 'QUOTATION'].includes(s.stage)).length,
      ACTIVE: list.filter(s => s.stage === 'ACTIVE').length,
      PAUSED: list.filter(s => s.stage === 'PAUSED').length,
      CLOSED: list.filter(s => s.stage === 'CLOSED').length,
    };
  }, [subscriptions, role, persona.id]);

  const handleExportCsv = () => {
    const today = new Date().toISOString().slice(0, 10);
    const headers = [
      'Reference',
      'Customer',
      'Plan',
      'Interval',
      'Grand Total',
      'Stage',
      'Created Date',
    ];
    const rows = filteredSubscriptions.map(sub => [
      sub.sub_number,
      sub.customer_name,
      sub.plan_name,
      sub.billing_interval,
      Number(sub.grand_total).toFixed(2),
      sub.stage,
      sub.created_at ? sub.created_at.slice(0, 10) : '',
    ]);
    exportToCsv(`brightloop-subscriptions-${today}.csv`, headers, rows);
    toast(`Exported ${filteredSubscriptions.length} subscriptions to CSV`, "info");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions & Quotations"
        description="Manage the full lifecycle from early draft quotes to confirmed recurring contracts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Subscriptions' }
        ]}
        actions={
          role !== 'CUSTOMER' ? (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold rounded-md shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              New Quote / Subscription
            </button>
          ) : undefined
        }
      />

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {/* Stage Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['ALL', 'QUOTES', 'ACTIVE', 'PAUSED', 'CLOSED'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <span>{tab === 'ALL' ? 'All Records' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === tab
                  ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by ref, customer, plan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all font-sans"
            />
          </div>
          <button
            onClick={handleExportCsv}
            disabled={filteredSubscriptions.length === 0}
            title="Export filtered subscriptions to CSV"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={fetchSubscriptions}
            title="Refresh list"
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-medium">
                <th className="py-2.5 px-4">Reference</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Plan & Interval</th>
                <th className="py-2.5 px-4">Stage</th>
                <th className="py-2.5 px-4">Grand Total</th>
                <th className="py-2.5 px-4">Expiry / Renewal</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading && subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                      Loading records...
                    </div>
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-zinc-500">
                      <FileText className="w-8 h-8 stroke-1 text-zinc-400" />
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">
                        {searchQuery || activeTab !== 'ALL'
                          ? 'No matching subscriptions found'
                          : 'No subscriptions found'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {searchQuery || activeTab !== 'ALL'
                          ? 'No records match your active filter or search query.'
                          : 'There are no records in this view stage yet.'}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {(searchQuery || activeTab !== 'ALL') && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setActiveTab('ALL');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors active:scale-[0.98]"
                          >
                            Reset Filters
                          </button>
                        )}
                        {role !== 'CUSTOMER' && (
                          <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors active:scale-[0.98]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Create Quotation
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map(sub => (
                  <tr
                    key={sub.id}
                    onClick={() => router.push(`/subscriptions/${sub.id}`)}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                          {sub.sub_number}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{sub.customer_name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">{sub.customer_email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{sub.plan_name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-mono">
                          {sub.billing_interval}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge stage={sub.stage} />
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      ${Number(sub.grand_total).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {sub.expiry_date || sub.start_date || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/subscriptions/${sub.id}`}
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Studio
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Subscription Drawer */}
      <NewSubscriptionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCreated={(id) => {
          setIsDrawerOpen(false);
          router.push(`/subscriptions/${id}`);
        }}
      />
    </div>
  );
}
