"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  Check,
  X,
  Lock,
  Mail,
  Building,
  User,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { setRole } = useRole();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // strict password validation metrics per spec (>8 chars, uppercase, lowercase, special)
  const validation = useMemo(() => {
    return {
      hasMinLength: password.length >= 9,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const isPasswordValid =
    validation.hasMinLength &&
    validation.hasUpper &&
    validation.hasLower &&
    validation.hasSpecial;

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError("Please satisfy all password complexity rules before continuing.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please re-enter your password confirmation.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account profile.");
      }

      // dispatch customer session and route to self-service portal
      setRole("CUSTOMER", {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: "CUSTOMER",
        company: company.trim() || "Customer",
        title: `${company.trim() || "Customer"} Account`,
      });

      router.push("/portal");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-sm dark:bg-zinc-100 dark:text-zinc-900 shadow-md font-mono">
            OL
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Create your account
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Start managing recurring subscriptions and enterprise invoices.
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
                  placeholder="e.g. Liam Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Company / Organization
              </label>
              <div className="relative mt-1">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Business Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="liam@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Password
              </label>
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

              {/* Interactive Requirement Checklist (4 Dynamic Pills) */}
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-all border ${
                    validation.hasMinLength
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40"
                  }`}
                >
                  {validation.hasMinLength ? (
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 ml-1 mr-0.5" />
                  )}
                  <span>More than 8 chars (9+)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-all border ${
                    validation.hasUpper
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40"
                  }`}
                >
                  {validation.hasUpper ? (
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 ml-1 mr-0.5" />
                  )}
                  <span>Uppercase letter</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-all border ${
                    validation.hasLower
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40"
                  }`}
                >
                  {validation.hasLower ? (
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 ml-1 mr-0.5" />
                  )}
                  <span>Lowercase letter</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-all border ${
                    validation.hasSpecial
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40"
                  }`}
                >
                  {validation.hasSpecial ? (
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 ml-1 mr-0.5" />
                  )}
                  <span>Special character (!@#)</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-md border bg-white pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-900 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 ${
                    confirmPassword && !passwordsMatch
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-zinc-200 focus:border-zinc-900 dark:border-zinc-700"
                  }`}
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-[10px] text-rose-600">Passwords do not match.</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 py-2 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to signin */}
          <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
