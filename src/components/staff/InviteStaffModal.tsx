"use client";

import React, { useState } from "react";
import { X, UserPlus, Mail, User, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded: (newStaff: any) => void;
}

export function InviteStaffModal({
  isOpen,
  onClose,
  onStaffAdded,
}: InviteStaffModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill out both full name and work email.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision internal team member.");
      }

      toast(`Team member ${name.trim()} successfully invited as ${role}`, "success");
      onStaffAdded(data.staff);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while inviting staff.");
      toast(err.message || "Failed to invite staff member", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Invite Staff Member
              </h3>
              <p className="text-[11px] text-zinc-500">
                Provision internal access to the Outloop engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Full Name
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                required
                placeholder="e.g. Jordan Hayes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Work Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="jordan@brightloop.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Role Selector with Permissions Guidance */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Access Role & Scope
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "STAFF" | "ADMIN")}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="STAFF">Staff Specialist (Billing & Quotation Operations)</option>
              <option value="ADMIN">System Administrator (Full Infrastructure Access)</option>
            </select>

            <div className="mt-2 rounded-md border border-zinc-100 bg-zinc-50 p-2.5 text-[11px] text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-800/40">
              {role === "STAFF" ? (
                <span>
                  <strong>Staff Permission Scope:</strong> Can author quotations, activate subscriptions, run automated billing cycles, and reconcile payments. Base pricing rules and team provisioning remain locked.
                </span>
              ) : (
                <span>
                  <strong>Admin Permission Scope:</strong> Full unrestricted access across base catalog pricing, ERP connector variants, global billing automation, and internal staff provisioning.
                </span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )}
              Invite Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
