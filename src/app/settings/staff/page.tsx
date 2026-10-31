"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { RoleBadge } from "@/components/ui/StatusBadge";
import { InviteStaffModal } from "@/components/staff/InviteStaffModal";
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Mail,
  Calendar,
} from "lucide-react";

interface StaffProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  created_at: string;
}

export default function StaffSettingsPage() {
  const { role, setRole } = useRole();
  const { toast } = useToast();

  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error("Failed to load staff list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "ADMIN") {
      fetchStaff();
    }
  }, [role]);

  const handleRevokeAccess = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${name}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/staff?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to revoke staff access");
      }

      setStaff((prev) => prev.filter((s) => s.id !== id));
      setToastMessage(`Access revoked for ${name}.`);
      toast(`Access revoked for ${name}.`, "success");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      toast(err.message || "Failed to revoke staff access.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Access Restriction Guardrail (403 Access Banner)
  if (role !== "ADMIN") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Staff Directory & Provisioning"
          description="Internal team members and role-based permissions."
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Settings", href: "/settings/staff" },
            { label: "Staff Directory" },
          ]}
        />

        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Administrator Privileges Required (403 Forbidden)
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
            Internal team provisioning and role assignments are restricted strictly to System Administrators.
            Staff members and client accounts cannot invite colleagues or alter team permissions.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setRole("ADMIN")}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Switch to Sarah Connor (Admin)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const adminCount = staff.filter((s) => s.role === "ADMIN").length;
  const staffCount = staff.filter((s) => s.role === "STAFF").length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Staff Directory & Provisioning"
        description="Manage internal team access, provision staff specialists, and configure operational permissions."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Settings" },
          { label: "Staff Directory" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStaff}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite Staff Member
            </button>
          </div>
        }
      />

      {/* Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Internal Team Members"
          value={`${staff.length} Active`}
          subtitle="Total provisioned accounts"
          icon={Users}
        />
        <MetricCard
          title="Staff Specialists"
          value={`${staffCount} Specialists`}
          subtitle="Quotation & billing operators"
          icon={ShieldCheck}
        />
        <MetricCard
          title="System Administrators"
          value={`${adminCount} Admins`}
          subtitle="Full infrastructure access"
          icon={ShieldAlert}
        />
      </div>

      {/* Staff Directory Table */}
      <div className="rounded-lg border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Active Team Directory ({staff.length})
            </h3>
            <p className="text-[11px] text-zinc-500">
              Internal staff credentials with administrative or specialist privileges
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 font-medium">
                <th className="py-2.5 px-4">Member Name</th>
                <th className="py-2.5 px-4">Work Email</th>
                <th className="py-2.5 px-4">Access Role</th>
                <th className="py-2.5 px-4">Date Provisioned</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading && staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-zinc-400" />
                      Loading staff directory...
                    </div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-zinc-500">
                      <Users className="w-8 h-8 stroke-1 text-zinc-400" />
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 text-xs">No staff members found</p>
                      <p className="text-[11px] text-zinc-400">Invite colleagues to grant access to quotation management and billing operations.</p>
                      <button
                        onClick={() => setIsInviteOpen(true)}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-md active:scale-[0.98] transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Invite Staff Member
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                staff.map((member) => {
                  const isPrimaryAdmin = member.email === "admin@brightloop.io";

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 font-mono text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div>{member.name}</div>
                            {isPrimaryAdmin && (
                              <span className="text-[10px] text-zinc-400">Primary System Root</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400 text-xs">
                        {member.email}
                      </td>
                      <td className="py-3 px-4">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                        {member.created_at ? member.created_at.slice(0, 10) : "2025-10-01"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isPrimaryAdmin && (
                          <button
                            onClick={() => handleRevokeAccess(member.id, member.name)}
                            disabled={deletingId === member.id}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors active:scale-[0.98] disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Revoke Access
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteStaffModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onStaffAdded={(newStaff) => {
          setStaff((prev) => [newStaff, ...prev]);
          setToastMessage(`Staff invitation sent to ${newStaff.email}.`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />
    </div>
  );
}
