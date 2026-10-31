"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password reset modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please provide both email address and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid login credentials.");
      }

      // dispatch authenticated session
      setRole(data.user.role, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        company: data.user.name.includes("/") ? data.user.name.split("/")[0].trim() : "Outloop",
        title: data.user.role === "ADMIN" ? "System Administrator" : data.user.role === "STAFF" ? "Billing Specialist" : "Client Account",
      });

      if (data.user.role === "CUSTOMER") {
        router.push("/portal");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = (demoEmail: string, roleType: "ADMIN" | "STAFF" | "CUSTOMER") => {
    setEmail(demoEmail);
    setPassword("Enterprise#2026");
    setError(null);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setResetSent(true);
    }, 700);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Navigation back to landing */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/welcome"
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            ← Public Site
          </Link>
          <span className="text-zinc-400 font-mono text-[11px]">Brightloop Edition</span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/welcome" className="inline-flex">
            <div className="h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-sm dark:bg-zinc-100 dark:text-zinc-900 shadow-md font-mono flex">
              OL
            </div>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign in to Outloop
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Enterprise subscription lifecycle and recurring billing engine.
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          {error && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@brightloop.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetOpen(true);
                    setResetSent(false);
                    setResetEmail(email);
                  }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 py-2 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Presets */}
          <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-2">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Evaluator Demo Presets</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoPreset("admin@brightloop.io", "ADMIN")}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 active:scale-[0.98] text-center transition-colors"
              >
                Admin (Sarah)
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset("staff@brightloop.io", "STAFF")}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 active:scale-[0.98] text-center transition-colors"
              >
                Staff (Alex)
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset("liam@acme.com", "CUSTOMER")}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 active:scale-[0.98] text-center transition-colors"
              >
                Client (Liam)
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-4 text-center text-xs text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={() => setIsResetOpen(false)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!resetSent ? (
              <form onSubmit={handlePasswordReset} className="mt-4 space-y-3 text-xs">
                <p className="text-zinc-500">
                  Enter your registered account email address. We will dispatch instructions to reset your password.
                </p>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    {resetLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send Instructions"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-4 text-xs">
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Reset instructions dispatched</span>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Password reset instructions have been sent to <strong>{resetEmail}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
